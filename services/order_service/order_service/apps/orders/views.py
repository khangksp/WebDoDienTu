from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from .middleware import auth_required
from functools import wraps
from .rabbitmq import publish_order_event

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @auth_required
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Publish order created event
        order_data = {
            'order_id': order.id,
            'user_id': order.user_id,
            'status': order.status,
            'total_amount': float(order.total_amount),
            'items': [
                {
                    'product_id': item.product_id,
                    'quantity': item.quantity
                } for item in order.items.all()
            ]
        }
        publish_order_event('created', order_data)
        
        return Response({
            'message': 'Order created successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)
    
    def get_queryset(self):
        queryset = Order.objects.all()
        
        # If user is authenticated, filter orders by user_id
        if hasattr(self.request, 'user_data') and self.request.user_data:
            queryset = queryset.filter(user_id=self.request.user_data['id'])
        
        # Allow filtering by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())
        
        return queryset
    
    @action(detail=True, methods=['post'])
    @auth_required
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        # Check if user owns this order
        if order.user_id != request.user_data['id']:
            return Response({
                'message': 'You do not have permission to cancel this order'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if order can be cancelled
        if order.status in ['SHIPPED', 'DELIVERED']:
            return Response({
                'message': f'Order in {order.status} status cannot be cancelled'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save old status for event
        old_status = order.status
        
        # Cancel order
        order.status = 'CANCELLED'
        order.save()
        
        # Publish order cancelled event
        order_data = {
            'order_id': order.id,
            'user_id': order.user_id,
            'old_status': old_status,
            'status': order.status,
            'total_amount': float(order.total_amount),
            'items': [
                {
                    'product_id': item.product_id,
                    'quantity': item.quantity
                } for item in order.items.all()
            ]
        }
        publish_order_event('cancelled', order_data)
        
        # Note: We're no longer directly updating product stock here
        # Instead, we rely on the product service to receive the event and update stock
        
        return Response({
            'message': 'Order cancelled successfully',
            'order': OrderSerializer(order).data
        })
    
    @action(detail=True, methods=['post'])
    @auth_required
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({
                'message': 'Status is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate status transition
        valid_transitions = {
            'PENDING': ['PROCESSING', 'CANCELLED'],
            'PROCESSING': ['SHIPPED', 'CANCELLED'],
            'SHIPPED': ['DELIVERED'],
            'DELIVERED': [],
            'CANCELLED': []
        }
        
        if new_status.upper() not in valid_transitions[order.status]:
            return Response({
                'message': f'Cannot transition from {order.status} to {new_status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save old status for event
        old_status = order.status
        
        # Update status
        order.status = new_status.upper()
        order.save()
        
        # Publish order updated event
        order_data = {
            'order_id': order.id,
            'user_id': order.user_id,
            'old_status': old_status,
            'status': order.status,
            'total_amount': float(order.total_amount),
            'items': [
                {
                    'product_id': item.product_id,
                    'quantity': item.quantity
                } for item in order.items.all()
            ]
        }
        publish_order_event('updated', order_data)
        
        return Response({
            'message': 'Order status updated successfully',
            'order': OrderSerializer(order).data
        })