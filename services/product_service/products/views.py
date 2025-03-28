import json
import pika
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Product
from .serializers import ProductSerializer

# Hàm gửi message đến RabbitMQ
def send_order_to_queue(order_data):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="rabbitmq"))
    channel = connection.channel()

    # Khai báo hàng đợi (nếu chưa có)
    channel.queue_declare(queue="order_queue")

    # Gửi message
    channel.basic_publish(
        exchange="",
        routing_key="order_queue",
        body=json.dumps(order_data),
        properties=pika.BasicProperties(
            delivery_mode=2,  # Bảo đảm message không bị mất khi RabbitMQ restart
        ),
    )

    connection.close()


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    # API đặt hàng: /api/products/{id}/order/
    @action(detail=True, methods=["post"])
    def order(self, request, pk=None):
        product = get_object_or_404(Product, pk=pk)
        quantity = int(request.data.get("quantity", 1))

        if product.stock >= quantity:
            product.stock -= quantity
            product.save()

            # Gửi đơn hàng đến RabbitMQ
            order_data = {
                "product_id": product.id,
                "quantity": quantity,
            }
            send_order_to_queue(order_data)

            return Response({"message": "Order placed successfully!"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Not enough stock!"}, status=status.HTTP_400_BAD_REQUEST)
