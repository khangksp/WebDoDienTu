import json
import threading
import logging
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from .utils import get_rabbitmq_client
from .models import ThanhToan, UserBalance

logger = logging.getLogger(__name__)

def message_callback(ch, method, properties, body):
    """
    Callback function to process incoming RabbitMQ messages
    """
    try:
        message = json.loads(body)
        routing_key = method.routing_key

        logger.info(f"Received message with routing key {routing_key}: {message}")

        if routing_key == 'order.created':
            order_id = message.get('order_id')
            user_id = message.get('user_id')
            payment_method = message.get('payment_method')
            total_amount = message.get('total_amount')

            if not all([order_id, user_id, payment_method, total_amount]):
                logger.error(f"Missing required fields in order.created message: {message}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return

            with transaction.atomic():
                if payment_method == 'ewallet':
                    # Kiểm tra và trừ số dư
                    try:
                        user_balance = UserBalance.objects.get(user_id=user_id)
                        if user_balance.balance >= total_amount:
                            user_balance.balance -= total_amount
                            user_balance.save()
                            status = 'Hoàn tất'
                        else:
                            logger.error(f"Insufficient balance for user {user_id}")
                            status = 'Thất bại'
                    except UserBalance.DoesNotExist:
                        logger.error(f"No balance record for user {user_id}")
                        status = 'Thất bại'
                else:
                    # Cash hoặc Stripe: Đặt trạng thái ban đầu là Chờ xử lý
                    status = 'Chờ xử lý'

                # Tạo bản ghi ThanhToan
                thanh_toan = ThanhToan.objects.create(
                    fk_MaDonHang=order_id,
                    PhuongThucThanhToan=payment_method,
                    NgayThanhToan=timezone.now().date(),
                    TrangThaiThanhToan=status
                )

                logger.info(f"Created ThanhToan for order #{order_id}: {thanh_toan.pk_MaThanhToan}")

                # Publish sự kiện payment.created
                client = get_rabbitmq_client()
                payment_data = {
                    'payment_id': thanh_toan.pk_MaThanhToan,
                    'order_id': order_id,
                    'status': status,
                    'payment_method': payment_method,
                    'created_at': thanh_toan.NgayThanhToan.isoformat()
                }
                client.publish('payment.created', payment_data)
                client.close()

            ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        logger.error(f"Error processing message: {str(e)}", exc_info=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_consumer():
    try:
        client = get_rabbitmq_client()
        queue_name = 'payment_service_queue'
        routing_keys = ['order.created']
        client.consume(queue_name, routing_keys, message_callback)
    except Exception as e:
        logger.error(f"Error starting RabbitMQ consumer: {str(e)}", exc_info=True)

def start_consumer_thread():
    try:
        consumer_thread = threading.Thread(target=start_consumer)
        consumer_thread.daemon = True
        consumer_thread.start()
        logger.info("Started RabbitMQ consumer thread for payment service")
    except Exception as e:
        logger.error(f"Error starting consumer thread: {str(e)}", exc_info=True)