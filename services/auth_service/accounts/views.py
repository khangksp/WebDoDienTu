from accounts.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.vaitro != 'admin':
            return Response(
                {"status": "error", "message": "Chỉ admin mới được xem danh sách người dùng"},
                status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.all()
        user_data = [{
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "vaitro": user.vaitro,
            "created_at": user.created_at
        } for user in users]
        return Response({"status": "ok", "users": user_data})

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "id": user.id,
                "access": str(refresh.access_token),
                "vaitro": user.vaitro
            }, status=status.HTTP_200_OK)
        return Response(
            {"status": "error", "message": "Thông tin đăng nhập không hợp lệ"},
            status=status.HTTP_401_UNAUTHORIZED
        )

class RegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.vaitro != 'admin':
            return Response(
                {"status": "error", "message": "Chỉ admin mới được tạo người dùng"},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        vaitro = request.data.get('vaitro', 'khach')

        VALID_ROLES = ['admin', 'khach', 'nhanvien']
        if vaitro not in VALID_ROLES:
            return Response(
                {"status": "error", "message": f"Vai trò '{vaitro}' không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_ROLES)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not username or not email or not password:
            return Response(
                {"status": "error", "message": "Username, email, và password là bắt buộc"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"status": "error", "message": "Username đã tồn tại"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"status": "error", "message": "Email đã tồn tại"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.create_user(username=username, email=email, 
                                            password=password, vaitro=vaitro)
            user.is_active = True
            user.save()
            return Response(
                {"status": "ok", "message": "Tạo người dùng thành công", "vaitro": user.vaitro},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": f"Lỗi khi tạo người dùng: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, user_id):
        user_to_update = get_object_or_404(User, id=user_id)
        
        if request.user.vaitro != 'admin':
            return Response(
                {"status": "error", "message": "Chỉ admin mới được sửa thông tin người dùng"},
                status=status.HTTP_403_FORBIDDEN
            )

        email = request.data.get('email')
        vaitro = request.data.get('vaitro')
        password = request.data.get('matkhau')

        if email:
            if User.objects.exclude(id=user_id).filter(email=email).exists():
                return Response(
                    {"status": "error", "message": "Email đã được sử dụng bởi người dùng khác"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_to_update.email = email

        if vaitro:
            VALID_ROLES = ['admin', 'khach', 'nhanvien']
            if vaitro not in VALID_ROLES:
                return Response(
                    {"status": "error", "message": f"Vai trò '{vaitro}' không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_ROLES)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_to_update.vaitro = vaitro

        if password:
            if len(password) < 6:
                return Response(
                    {"status": "error", "message": "Mật khẩu phải có ít nhất 6 ký tự"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_to_update.set_password(password)

        user_to_update.save()

        return Response({
            "status": "ok",
            "message": "Cập nhật thông tin người dùng thành công",
            "user": {
                "id": user_to_update.id,
                "username": user_to_update.username,
                "email": user_to_update.email,
                "vaitro": user_to_update.vaitro
            }
        }, status=status.HTTP_200_OK)

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        if request.user.vaitro != 'admin':
            return Response(
                {"status": "error", "message": "Chỉ admin mới được xóa người dùng"},
                status=status.HTTP_403_FORBIDDEN
            )

        user_to_delete = get_object_or_404(User, id=user_id)
        if user_to_delete.vaitro == 'admin' and User.objects.filter(vaitro='admin').count() <= 1:
            return Response(
                {"status": "error", "message": "Không thể xóa admin cuối cùng"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_to_delete.delete()
        return Response({
            "status": "ok",
            "message": f"Đã xóa người dùng {user_to_delete.username} thành công"
        }, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user_to_view = get_object_or_404(User, id=user_id)
        
        if request.user.vaitro != 'admin' and request.user.id != user_to_view.id:
            return Response(
                {"status": "error", "message": "Bạn không có quyền xem thông tin người dùng này"},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            "status": "ok",
            "user": {
                "id": user_to_view.id,
                "username": user_to_view.username,
                "email": user_to_view.email,
                "vaitro": user_to_view.vaitro,
                "created_at": user_to_view.created_at
            }
        }, status=status.HTTP_200_OK)