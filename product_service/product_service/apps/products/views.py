from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from .middleware import auth_required
from .rabbitmq import publish_product_event

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
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
        
        self.perform_destroy(instance)
        
        # Publish product deleted event
        publish_product_event('deleted', product_data)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        try:
            product = self.get_object()
            old_stock = product.stock
            quantity = int(request.data.get('quantity', 0))
            
            if quantity < 0 and abs(quantity) > product.stock:
                return Response(
                    {"message": "Not enough stock available"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product.stock += quantity
            product.save()
            
            # Publish stock changed event
            publish_product_event('stock_changed', {
                'product_id': product.id,
                'old_stock': old_stock,
                'new_stock': product.stock,
                'change': quantity
            })
            
            return Response({
                "message": f"Stock updated successfully. New stock: {product.stock}",
                "stock": product.stock
            })
        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )