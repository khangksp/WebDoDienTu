from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'product_id', 'quantity', 'total_price', 'created_at']
        read_only_fields = ['total_price', 'created_at']  # Tự động tính, không cần nhập
