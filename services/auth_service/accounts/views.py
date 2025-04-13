from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import TaiKhoan, NguoiDung
from .serializers import TaiKhoanSerializer

class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # if request.user.loaiquyen != 'admin':
        #     return Response(
        #         {"status": "error", "message": "Chỉ admin mới được xem danh sách người dùng"},
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        users = TaiKhoan.objects.all()
        serializer = TaiKhoanSerializer(users, many=True)
        return Response({"status": "ok", "users": serializer.data})

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tendangnhap = request.data.get('tendangnhap')
        password = request.data.get('password')

        if not tendangnhap or not password:
            return Response(
                {"status": "error", "message": "Tên đăng nhập và mật khẩu là bắt buộc"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            taikhoan = TaiKhoan.objects.get(tendangnhap=tendangnhap)
            if taikhoan.check_password(password):
                taikhoan.last_login = timezone.now()
                taikhoan.save(update_fields=['last_login'])
                refresh = RefreshToken.for_user(taikhoan)
                serializer = TaiKhoanSerializer(taikhoan)
                user_data = serializer.data
                user_data.pop('nguoidung', None)  # Loại bỏ nguoidung (write_only)

                return Response({
                    "status": "ok",
                    "message": "Đăng nhập thành công",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": user_data
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"status": "error", "message": "Mật khẩu không đúng"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except TaiKhoan.DoesNotExist:
            return Response(
                {"status": "error", "message": "Tên đăng nhập không tồn tại"},
                status=status.HTTP_401_UNAUTHORIZED
            )

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        # if request.user.loaiquyen != 'admin':
        #     return Response(
        #         {"status": "error", "message": "Chỉ admin mới được tạo người dùng"},
        #         status=status.HTTP_403_FORBIDDEN
        #     )

        serializer = TaiKhoanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            user_data = serializer.data
            user_data.pop('nguoidung', None)  # Loại bỏ nguoidung (write_only)
            return Response(
                {"status": "ok", "message": "Tạo người dùng thành công", "user": user_data},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"status": "error", "message": "Tạo người dùng thất bại", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, user_id):
        # Lấy đối tượng TaiKhoan
        taikhoan = get_object_or_404(TaiKhoan, mataikhoan=user_id)

        # Kiểm tra quyền admin
        if request.user.loaiquyen != 'admin':
            return Response(
                {"status": "error", "message": "Chỉ admin mới được sửa thông tin người dùng"},
                status=status.HTTP_403_FORBIDDEN
            )
        if 'tendangnhap' in request.data:
            return Response(
                {"status": "error", "message": "Tên đăng nhập không được phép cập nhật"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Lấy hoặc tạo đối tượng NguoiDung
        nguoidung = taikhoan.nguoidung.first()
        if not nguoidung and any(key in request.data.get('nguoidung', {}) for key in ['tennguoidung', 'email', 'sodienthoai', 'diachi']):
            nguoidung = NguoiDung(fk_taikhoan=taikhoan)

        # Lấy dữ liệu từ request
        tendangnhap = request.data.get('tendangnhap')
        password = request.data.get('password')
        loaiquyen = request.data.get('loaiquyen')
        nguoidung_data = request.data.get('nguoidung', {})
        tennguoidung = nguoidung_data.get('tennguoidung')
        email = nguoidung_data.get('email')
        sodienthoai = nguoidung_data.get('sodienthoai')
        diachi = nguoidung_data.get('diachi')

        # Cập nhật tendangnhap
        if tendangnhap:
            if TaiKhoan.objects.exclude(mataikhoan=taikhoan.mataikhoan).filter(tendangnhap=tendangnhap).exists():
                return Response(
                    {"status": "error", "message": "Tên đăng nhập đã được sử dụng bởi người dùng khác"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            taikhoan.tendangnhap = tendangnhap

        # Cập nhật password
        if password:
            if len(password) < 6:
                return Response(
                    {"status": "error", "message": "Mật khẩu phải có ít nhất 6 ký tự"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            taikhoan.set_password(password)

        # Cập nhật loaiquyen
        if loaiquyen:
            VALID_ROLES = ['admin', 'khach', 'nhanvien']
            if loaiquyen not in VALID_ROLES:
                return Response(
                    {"status": "error", "message": f"Loại quyền '{loaiquyen}' không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_ROLES)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            taikhoan.loaiquyen = loaiquyen

        # Cập nhật nguoidung
        if nguoidung:
            # Kiểm tra tennguoidung
            if tennguoidung is not None:  # Nếu gửi tennguoidung
                if nguoidung.tennguoidung and (tennguoidung == '' or tennguoidung is None):
                    return Response(
                        {"status": "error", "message": "Tên người dùng không được để trống vì đã có giá trị"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                nguoidung.tennguoidung = tennguoidung

            # Kiểm tra email
            if email is not None:
                if nguoidung.email and (email == '' or email is None):
                    return Response(
                        {"status": "error", "message": "Email không được để trống vì đã có giá trị"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if email and NguoiDung.objects.exclude(fk_taikhoan=taikhoan).filter(email=email).exists():
                    return Response(
                        {"status": "error", "message": "Email đã được sử dụng bởi người dùng khác"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                nguoidung.email = email

            # Kiểm tra sodienthoai
            if sodienthoai is not None:
                if nguoidung.sodienthoai and (sodienthoai == '' or sodienthoai is None):
                    return Response(
                        {"status": "error", "message": "Số điện thoại không được để trống vì đã có giá trị"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if sodienthoai and NguoiDung.objects.exclude(fk_taikhoan=taikhoan).filter(sodienthoai=sodienthoai).exists():
                    return Response(
                        {"status": "error", "message": "Số điện thoại đã được sử dụng bởi người dùng khác"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                nguoidung.sodienthoai = sodienthoai

            # Kiểm tra diachi
            if diachi is not None:
                if nguoidung.diachi and (diachi == '' or diachi is None):
                    return Response(
                        {"status": "error", "message": "Địa chỉ không được để trống vì đã có giá trị"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                nguoidung.diachi = diachi

        # Lưu dữ liệu
        try:
            taikhoan.save()
            if nguoidung:
                nguoidung.save()
        except Exception as e:
            return Response(
                {"status": "error", "message": f"Lỗi khi lưu dữ liệu: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Serialize dữ liệu trả về
        serializer = TaiKhoanSerializer(taikhoan)
        user_data = serializer.data
        user_data.pop('nguoidung', None)

        return Response({
            "status": "ok",
            "message": "Cập nhật thông tin người dùng thành công",
            "user": user_data
        }, status=status.HTTP_200_OK)
class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        if request.user.loaiquyen != 'admin':
            return Response(
                {"status": "error", "message": "Chỉ admin mới được xóa người dùng"},
                status=status.HTTP_403_FORBIDDEN
            )

        taikhoan = get_object_or_404(TaiKhoan, mataikhoan=user_id)
        if taikhoan.loaiquyen == 'admin' and TaiKhoan.objects.filter(loaiquyen='admin').count() <= 1:
            return Response(
                {"status": "error", "message": "Không thể xóa admin cuối cùng"},
                status=status.HTTP_400_BAD_REQUEST
            )

        taikhoan.delete()
        return Response({
            "status": "ok",
            "message": f"Đã xóa người dùng {taikhoan.tendangnhap} thành công"
        }, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        taikhoan = get_object_or_404(TaiKhoan, mataikhoan=user_id)

        if request.user.loaiquyen != 'admin' and request.user.id != taikhoan.id:
            return Response(
                {"status": "error", "message": "Bạn không có quyền xem thông tin người dùng này"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TaiKhoanSerializer(taikhoan)
        user_data = serializer.data
        user_data.pop('nguoidung', None)

        return Response({
            "status": "ok",
            "user": user_data
        }, status=status.HTTP_200_OK)