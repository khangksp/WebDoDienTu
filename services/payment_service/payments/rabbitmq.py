# File: payment_service/apps/payments/rabbitmq.py

import json
import threading
import logging
from django.conf import settings
from django.utils import timezone
from .utils import get_rabbitmq_client
from .models import ThanhToan

logger = logging.getLogger(__name__)

def message_callback(ch, method, properties, body):
    """
    Callback function to process incoming RabbitMQ messages
    """
    try:
        message = json.loads(body)
        routing_key = method.routing_key

        logger.info(f"Received message with routing key {routing_key}: {message}")

        # Process order.created event
        if routing_key == 'order.created':
            order_id = message.get('order_id')
            user_id = message.get('user_id')
            payment_method = message.get('payment_method')
            total_amount = message.get('total_amount')

            if not all([order_id, user_id, payment_method, total_amount]):
                logger.error(f"Missing required fields in order.created message: {message}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return

            # Create a new ThanhToan record
            thanh_toan = ThanhToan.objects.create(
                fk_MaDonHang=order_id,
                PhuongThucThanhToan=payment_method,
                NgayThanhToan=timezone.now().date(),
                TrangThaiThanhToan='processing'  # Initial status
            )

            logger.info(f"Created ThanhToan record for order #{order_id}: {thanh_toan.pk_MaThanhToan}")

            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        logger.error(f"Error processing message: {str(e)}", exc_info=True)
        # Reject message
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_consumer():
    """
    Start consuming messages from RabbitMQ
    """
    try:
        client = get_rabbitmq_client()

        # Payment service is interested in order.created events
        queue_name = 'payment_service_queue'
        routing_keys = ['order.created']

        client.consume(queue_name, routing_keys, message_callback)
    except Exception as e:
        logger.error(f"Error starting RabbitMQ consumer: {str(e)}", exc_info=True)

def start_consumer_thread():
    """
    Start RabbitMQ consumer in a separate thread
    """
    try:
        consumer_thread = threading.Thread(target=start_consumer)
        consumer_thread.daemon = True
        consumer_thread.start()
        logger.info("Started RabbitMQ consumer thread for payment service")
    except Exception as e:
        logger.error(f"Error starting consumer thread: {str(e)}", exc_info=True)