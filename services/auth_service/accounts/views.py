# views.py
from accounts.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny

class UserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.all()
        return Response({"status": "ok", "users": [user.username for user in users]})

class LoginView(APIView):
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
                "vaitro": user.vaitro  # Đổi từ role sang vaitro
            }, status=status.HTTP_200_OK)
        return Response({"status": "error", "message": "Invalid credentials"}, 
                       status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        vaitro = request.data.get('vaitro', 'khach')  # Mặc định là 'khach'

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
