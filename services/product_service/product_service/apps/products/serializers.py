from rest_framework import serializers
from django.conf import settings
from .models import Category, Product, HangSanXuat, ThongSo, KhuyenMai

# Thêm cấu hình API Gateway URL (có thể đặt trong settings.py)
API_GATEWAY_URL = getattr(settings, 'API_GATEWAY_URL', 'http://localhost:8000')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class HangSanXuatSerializer(serializers.ModelSerializer):
    class Meta:
        model = HangSanXuat
        fields = ['id', 'TenHangSanXuat']

class ThongSoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThongSo
        fields = ['id', 'TenThongSo']

class KhuyenMaiSerializer(serializers.ModelSerializer):
    class Meta:
        model = KhuyenMai
        fields = ['id', 'TenKhuyenMai', 'GiamGia', 'NgayBatDau', 'NgayKetThuc']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    hang_san_xuat_name = serializers.ReadOnlyField(source='hang_san_xuat.TenHangSanXuat', default=None)
    thong_so_name = serializers.ReadOnlyField(source='thong_so.TenThongSo', default=None)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 
            'category', 'category_name', 
            'hang_san_xuat', 'hang_san_xuat_name',
            'thong_so', 'thong_so_name',
            'khuyen_mai', 'image', 'image_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'image_url']
        extra_kwargs = {
            'image': {'required': False}
        }
    
    def get_image_url(self, obj):
        """
        Trả về URL đầy đủ của hình ảnh thông qua API Gateway
        """
        if obj.image:
            # Lấy tên file từ đường dẫn đầy đủ
            image_filename = obj.image.name.split('/')[-1]
            # Trả về URL thông qua API Gateway
            return f"{API_GATEWAY_URL}/media/products/{image_filename}"
        return None
    
    def validate_image(self, value):
        """
        Kiểm tra file ảnh hợp lệ
        """
        if value:
            # Kiểm tra kích thước file (ví dụ: tối đa 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Kích thước ảnh không được vượt quá 5MB")
            
            # Kiểm tra loại file
            valid_extensions = ['jpg', 'jpeg', 'png', 'webp']
            ext = value.name.split('.')[-1].lower()
            if ext not in valid_extensions:
                raise serializers.ValidationError(
                    f"Chỉ chấp nhận ảnh có định dạng: {', '.join(valid_extensions)}"
                )
                
        return value