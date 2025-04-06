from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet,
    HangSanXuatViewSet, ThongSoViewSet, KhuyenMaiViewSet
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='categories')
router.register('hang-san-xuat', HangSanXuatViewSet, basename='hang-san-xuat')
router.register('thong-so', ThongSoViewSet, basename='thong-so')
router.register('khuyen-mai', KhuyenMaiViewSet, basename='khuyen-mai')
router.register('products', ProductViewSet, basename='products')

urlpatterns = [
    path('', include(router.urls)),
]