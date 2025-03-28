import json
import pika
import threading
from rest_framework import viewsets
from .models import Order
from .serializers import OrderSerializer

# Hàm xử lý khi nhận message từ RabbitMQ
def process_order(ch, method, properties, body):
    data = json.loads(body)

    # Giả sử bạn có giá sản phẩm từ message (có thể lấy từ DB hoặc API khác)
    product_price = data.get("product_price", 0)  # Lấy giá sản phẩm từ message hoặc mặc định là 0

    # Tạo đơn hàng mới từ message
    order = Order.objects.create(
        product_id=data["product_id"],
        quantity=data["quantity"],
        total_price=product_price * data["quantity"]  # Tính tổng tiền
    )

    print(f"✅ Đơn hàng đã được tạo: {order}")

    # Xác nhận message đã được xử lý
    ch.basic_ack(delivery_tag=method.delivery_tag)



# Hàm lắng nghe RabbitMQ trong luồng riêng
def start_order_listener():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="rabbitmq"))
    channel = connection.channel()

    # Khai báo hàng đợi (nếu chưa có)
    channel.queue_declare(queue="order_queue")

    # Lắng nghe hàng đợi
    channel.basic_consume(queue="order_queue", on_message_callback=process_order)

    print("📡 Đang lắng nghe đơn hàng từ RabbitMQ...")
    channel.start_consuming()


# Chạy lắng nghe RabbitMQ trong một luồng riêng
threading.Thread(target=start_order_listener, daemon=True).start()


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
