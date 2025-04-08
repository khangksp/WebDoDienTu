from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Category, Product, HangSanXuat, ThongSo, KhuyenMai
from .serializers import (
    CategorySerializer, ProductSerializer,
    HangSanXuatSerializer, ThongSoSerializer, KhuyenMaiSerializer
)
from .middleware import auth_required
from .rabbitmq import publish_product_event

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class HangSanXuatViewSet(viewsets.ModelViewSet):
    queryset = HangSanXuat.objects.all()
    serializer_class = HangSanXuatSerializer

class ThongSoViewSet(viewsets.ModelViewSet):
    queryset = ThongSo.objects.all()
    serializer_class = ThongSoSerializer

class KhuyenMaiViewSet(viewsets.ModelViewSet):
    queryset = KhuyenMai.objects.all()
    serializer_class = KhuyenMaiSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by name search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by name search
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        # Filter by hang san xuat
        hang_san_xuat = self.request.query_params.get('hang_san_xuat')
        if hang_san_xuat:
            queryset = queryset.filter(hang_san_xuat_id=hang_san_xuat)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Publish product created event
        product_data = ProductSerializer(product).data
        publish_product_event('created', product_data)
        
        headers = self.get_success_headers(serializer.data)
        return Response(product_data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Publish product updated event
        product_data = ProductSerializer(product).data
        publish_product_event('updated', product_data)
        
        return Response(product_data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        product_data = ProductSerializer(instance).data
        
        # Xóa file ảnh nếu có
        if instance.image:
            if os.path.isfile(instance.image.path):
                os.remove(instance.image.path)
        
        self.perform_destroy(instance)
        
        # Publish product deleted event
        publish_product_event('deleted', product_data)
        
        return Response(status=status.HTTP_204_NO_CONTENT)