# urls.py
from django.urls import path
from .views import LoginView, UserListView, RegisterView, UserUpdateView, UserDeleteView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('users/<str:username>/update/', UserUpdateView.as_view(), name='user-update'),
    path('users/<str:username>/delete/', UserDeleteView.as_view(), name='user-delete'),
]