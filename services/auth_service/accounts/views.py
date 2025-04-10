from accounts.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.all()
        return Response({"status": "ok", "users": [user.username for user in users]})

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "status": "ok",
                "message": "Login successful",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "vaitro": user.vaitro
            }, status=status.HTTP_200_OK)
        return Response({"status": "error", "message": "Invalid credentials"}, 
                       status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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
                {"status": "error", "message": "Username, email, and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"status": "error", "message": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"status": "error", "message": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.create_user(username=username, email=email, 
                                            password=password, vaitro=vaitro)
            user.is_active = True
            user.save()
            return Response(
                {"status": "ok", "message": "User created successfully", "vaitro": user.vaitro},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": f"Error creating user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, user_id):
        """
        Update user details
        Chỉ cho phép người dùng cập nhật thông tin của chính mình hoặc admin cập nhật
        """
        user_to_update = get_object_or_404(User, id=user_id)
        
        # Kiểm tra quyền
        if request.user.vaitro != 'admin' and request.user.id != user_to_update.id:
            return Response(
                {"status": "error", "message": "Bạn không có quyền sửa thông tin người dùng này"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Lấy dữ liệu
        email = request.data.get('email')
        vaitro = request.data.get('vaitro')
        password = request.data.get('matkhau')

        # Cập nhật email
        if email:
            if User.objects.exclude(id=user_id).filter(email=email).exists():
                return Response(
                    {"status": "error", "message": "Email đã được sử dụng bởi người dùng khác"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_to_update.email = email

        # Cập nhật vai trò
        if vaitro:
            VALID_ROLES = ['admin', 'khach', 'nhanvien']
            if request.user.vaitro != 'admin':
                return Response(
                    {"status": "error", "message": "Chỉ admin mới được thay đổi vai trò"},
                    status=status.HTTP_403_FORBIDDEN
                )
            if vaitro not in VALID_ROLES:
                return Response(
                    {"status": "error", "message": f"Vai trò '{vaitro}' không hợp lệ. Chỉ chấp nhận: {', '.join(VALID_ROLES)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_to_update.vaitro = vaitro

        # Cập nhật mật khẩu
        if password:
            if len(password) < 6:
                return Response(
                    {"status": "error", "message": "Mật khẩu phải có ít nhất 6 ký tự"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_to_update.set_password(password)

        # Lưu thay đổi
        user_to_update.save()

        return Response({
            "status": "ok",
            "message": "Cập nhật thông tin người dùng thành công",
            "user": {
                "id": user_to_update.id,
                "username": user_to_update.username,
                "matkhau":user_to_update.password,
                "email": user_to_update.email,
                "vaitro": user_to_update.vaitro
            }
        }, status=status.HTTP_200_OK)
class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        """
        Xóa người dùng
        Chỉ admin mới được xóa người dùng
        """
        # Kiểm tra quyền: chỉ admin mới được xóa
        if request.user.vaitro != 'admin':
            return Response(
                {"status": "error", "message": "Bạn không có quyền xóa người dùng"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Lấy user cần xóa
        user_to_delete = get_object_or_404(User, id=user_id)

        # Không cho phép xóa tài khoản admin
        if user_to_delete.vaitro == 'admin':
            return Response(
                {"status": "error", "message": "Không thể xóa tài khoản admin"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Thực hiện xóa
        user_to_delete.delete()

        return Response({
            "status": "ok", 
            "message": f"Đã xóa người dùng {user_to_delete.username} thành công"
        }, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        """
        Lấy thông tin chi tiết người dùng
        Chỉ admin hoặc chính user mới được xem
        """
        # Lấy user cần xem
        user_to_view = get_object_or_404(User, id=user_id)
        
        # Kiểm tra quyền: chỉ admin hoặc chính user mới được xem
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