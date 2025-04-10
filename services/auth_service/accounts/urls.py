from django.urls import path
from .views import (
    LoginView, 
    UserListView, 
    RegisterView,
    UserUpdateView,
    UserDeleteView,
    UserDetailView
)

urlpatterns = [
    # Existing endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    
    # New endpoints for user management
    path('users/<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
    path('users/update/<int:user_id>/', UserUpdateView.as_view(), name='user-update'),
    path('users/delete/<int:user_id>/', UserDeleteView.as_view(), name='user-delete'),
]