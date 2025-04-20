import json
import pika
import logging
from django.conf import settings
import threading
import time
import os

# Cấu hình logging
logger = logging.getLogger(__name__)

# Import model SanPham
from .models import SanPham

# Cấu hình RabbitMQ từ settings
RABBITMQ_HOST = getattr(settings, 'RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_PORT = getattr(settings, 'RABBITMQ_PORT', 5672)
RABBITMQ_USER = getattr(settings, 'RABBITMQ_USER', 'guest')
RABBITMQ_PASS = getattr(settings, 'RABBITMQ_PASS', 'guest')

# Tên exchange và queue
PRODUCT_EXCHANGE = 'product_events'
PRODUCT_QUEUE = 'product_events_queue'

# Biến cờ để đánh dấu liệu RabbitMQ đã sẵn sàng
rabbitmq_available = False
consumer_thread = None
channel = None  # Khai báo biến channel ở phạm vi global

def get_rabbitmq_connection():
    try:
        import os
        print(f"RABBITMQ_HOST={RABBITMQ_HOST}, RABBITMQ_PORT={RABBITMQ_PORT}")
        print(f"RUNNING_IN_DOCKER={os.environ.get('RUNNING_IN_DOCKER')}")
        
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        parameters = pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            port=int(RABBITMQ_PORT),  # Đảm bảo port là số nguyên
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300
        )
        connection = pika.BlockingConnection(parameters)
        print("Kết nối thành công đến RabbitMQ!")
        return connection
    except Exception as e:
        import traceback
        print(f"Lỗi chi tiết: {str(e)}")
        print(traceback.format_exc())
        logger.error(f"Không thể kết nối đến RabbitMQ: {e}")
        return None

def publish_product_event(event_type, product_data):
    """
    Đăng sự kiện sản phẩm lên RabbitMQ exchange
    """
    global rabbitmq_available
    
    # Nếu RabbitMQ không khả dụng, ghi log và return
    if not rabbitmq_available:
        logger.warning(f"RabbitMQ không khả dụng. Bỏ qua publish sự kiện {event_type}")
        return False
    
    try:
        connection = get_rabbitmq_connection()
        if not connection:
            rabbitmq_available = False
            logger.error("Không thể kết nối đến RabbitMQ để publish sự kiện")
            return False
        
        ch = connection.channel()
        
        # Khai báo exchange
        ch.exchange_declare(exchange=PRODUCT_EXCHANGE, exchange_type='fanout', durable=True)
        
        # Chuẩn bị message
        message = {
            'event_type': event_type,
            'product': product_data
        }
        
        # Publish message
        ch.basic_publish(
            exchange=PRODUCT_EXCHANGE,
            routing_key='',
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Make message persistent
                content_type='application/json'
            )
        )
        
        connection.close()
        logger.info(f"Đã publish sự kiện {event_type} cho sản phẩm ID: {product_data.get('id')}")
        return True
    except Exception as e:
        rabbitmq_available = False
        logger.error(f"Lỗi khi publish sự kiện sản phẩm: {e}")
        return False

def start_consumer_thread():
    """
    Function để khởi động consumer thread
    """
    global channel
    if channel is not None:
        try:
            channel.start_consuming()
        except Exception as e:
            logger.error(f"Consumer bị ngắt: {e}")
            time.sleep(5)  # Đợi một chút trước khi kết nối lại
            setup_rabbitmq_consumer()  # Thử thiết lập lại consumer
    else:
        logger.error("Không thể khởi động consumer thread: channel is None")

def setup_rabbitmq_consumer():
    """
    Thiết lập consumer để nhận các sự kiện từ các service khác
    """
    global rabbitmq_available, consumer_thread, channel
    
    # Nếu chạy trong Docker thì mới thử kết nối RabbitMQ
    if os.environ.get('RUNNING_IN_DOCKER', 'False') == 'True':
        try:
            connection = get_rabbitmq_connection()
            if not connection:
                logger.error("Không thể kết nối đến RabbitMQ để thiết lập consumer")
                return False
            
            channel = connection.channel()
            
            # Khai báo exchange và queue
            channel.exchange_declare(exchange=PRODUCT_EXCHANGE, exchange_type='fanout', durable=True)
            result = channel.queue_declare(queue=PRODUCT_QUEUE, durable=True)
            queue_name = result.method.queue
            
            # Bind queue với exchange
            channel.queue_bind(exchange=PRODUCT_EXCHANGE, queue=queue_name)
            
            # Callback function khi nhận được message
            def callback(ch, method, properties, body):
                try:
                    data = json.loads(body)
                    logger.info(f"Đã nhận sự kiện: {data.get('event_type')}")
                    # Xử lý message ở đây nếu cần
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                except Exception as e:
                    logger.error(f"Lỗi khi xử lý message: {e}")
                    # Nack message để requeue nếu cần xử lý lại
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            
            # Thiết lập consumer
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=queue_name, on_message_callback=callback)
            
            # Khởi động consumer trong thread riêng biệt
            consumer_thread = threading.Thread(target=start_consumer_thread)
            consumer_thread.daemon = True
            consumer_thread.start()
            
            rabbitmq_available = True
            logger.info("Đã khởi động RabbitMQ consumer")
            return True
        except Exception as e:
            rabbitmq_available = False
            logger.error(f"Lỗi khi thiết lập RabbitMQ consumer: {e}")
            return False
    else:
        logger.info("Không chạy trong Docker, bỏ qua kết nối RabbitMQ")
        return False

# Khởi tạo consumer chỉ khi chạy trong Docker
if os.environ.get('RUNNING_IN_DOCKER', 'False') == 'True':
    try:
        setup_rabbitmq_consumer()
    except Exception as e:
        logger.error(f"Error starting RabbitMQ consumer: {e}")
else:
    logger.info("Phát hiện môi trường local, không khởi động RabbitMQ consumer")