from django.db import models
from django.utils.text import slugify
import os
import uuid

def product_image_path(instance, filename):
    """Generate file path for product images"""
    # Tạo tên file với UUID để tránh trùng lặp
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('products', filename)

class HangSanXuat(models.Model):
    TenHangSanXuat = models.CharField(max_length=50)
    
    def __str__(self):
        return self.TenHangSanXuat

class ThongSo(models.Model):
    TenThongSo = models.CharField(max_length=50)
    
    def __str__(self):
        return self.TenThongSo

class KhuyenMai(models.Model):
    TenKhuyenMai = models.CharField(max_length=100)
    GiamGia = models.DecimalField(max_digits=2, decimal_places=0)
    NgayBatDau = models.DateField()
    NgayKetThuc = models.DateField()
    
    def __str__(self):
        return self.TenKhuyenMai

class Category(models.Model):
    name = models.CharField(max_length=100)  # TenLoaiSanPham
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)  # TenSanPham
    description = models.TextField()  # MoTa
    price = models.DecimalField(max_digits=10, decimal_places=2)  # GiaBan
    stock = models.PositiveIntegerField(default=0)  # SoLuongTon
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)  # MaLoaiSanPham
    hang_san_xuat = models.ForeignKey(HangSanXuat, on_delete=models.CASCADE, null=True)  # MaHangSanXuat
    thong_so = models.ForeignKey(ThongSo, on_delete=models.CASCADE, null=True)  # MaThongSo
    khuyen_mai = models.ForeignKey(KhuyenMai, on_delete=models.SET_NULL, null=True, blank=True)  # MaKhuyenMai
    
    # Thay đổi từ URL sang ImageField để lưu ảnh
    image = models.ImageField(upload_to=product_image_path, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name