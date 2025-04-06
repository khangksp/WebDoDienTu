import jwt
import datetime
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer, UserLoginSerializer
from .rabbitmq import publish_user_event

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'login':
            return UserLoginSerializer
        return UserSerializer
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Publish user created event to RabbitMQ
        user_data = UserSerializer(user).data
        publish_user_event('created', user_data)
        
        return Response({
            'user': user_data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Publish user updated event to RabbitMQ
        user_data = UserSerializer(user).data
        publish_user_event('updated', user_data)
        
        return Response(user_data)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(email=email, password=password)
        
        if not user:
            return Response({
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWT token
        payload = {
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=settings.JWT_EXPIRATION_DELTA)
        }
        
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        
        return Response({
            'token': token,
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        token = request.META.get('HTTP_AUTHORIZATION', '').split(' ')[1] if 'HTTP_AUTHORIZATION' in request.META else None
        
        if not token:
            return Response({
                'message': 'Authentication credentials were not provided'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            user = User.objects.get(id=payload['user_id'])
            return Response(UserSerializer(user).data)
        except jwt.ExpiredSignatureError:
            return Response({
                'message': 'Token has expired'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except (jwt.DecodeError, User.DoesNotExist):
            return Response({
                'message': 'Invalid token'
            }, status=status.HTTP_401_UNAUTHORIZED)