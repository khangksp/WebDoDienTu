from django.urls import path
from .views import LoginView, UserListView,RegisterView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', RegisterView.as_view(), name='register')
]