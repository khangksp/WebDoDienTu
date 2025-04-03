from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'price', 'quantity', 'total_price', 'created_at']
        read_only_fields = ['id', 'created_at', 'total_price']

class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_id', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user_id', 'status', 'total_amount', 'shipping_address', 'contact_phone', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = ['shipping_address', 'contact_phone', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user_data = self.context['request'].user_data
        user_id = user_data['id']
        
        # Create order first with no items
        order = Order.objects.create(
            user_id=user_id,
            total_amount=0,  # Will be updated after adding items
            **validated_data
        )
        
        # Import requests here to avoid circular import
        import requests
        from django.conf import settings
        
        total_amount = 0
        
        # Add items one by one
        for item_data in items_data:
            product_id = item_data['product_id']
            quantity = item_data['quantity']
            
            # Get product details from Product service
            try:
                response = requests.get(f"{settings.PRODUCT_SERVICE_URL}/api/products/{product_id}/")
                if response.status_code == 200:
                    product_data = response.json()
                    
                    # Create order item
                    OrderItem.objects.create(
                        order=order,
                        product_id=product_id,
                        product_name=product_data['name'],
                        price=product_data['price'],
                        quantity=quantity
                    )
                    
                    # Update product stock
                    requests.post(
                        f"{settings.PRODUCT_SERVICE_URL}/api/products/{product_id}/update_stock/",
                        json={"quantity": -quantity}
                    )
                    
                    # Add to total amount
                    total_amount += float(product_data['price']) * quantity
                else:
                    # If product not found, raise error
                    raise serializers.ValidationError(f"Product with ID {product_id} not found")
            except requests.RequestException as e:
                # If there's a communication error, raise error
                raise serializers.ValidationError(f"Error communicating with Product service: {str(e)}")
        
        # Update order total amount
        order.total_amount = total_amount
        order.save()
        
        return order