# File: order_service/apps/orders/rabbitmq.py

import json
import threading
import logging
from django.conf import settings

# Import RabbitMQ utility (copy the RabbitMQClient class from above to this directory)
from .utils import get_rabbitmq_client
from .models import Order, OrderItem

logger = logging.getLogger(__name__)

def message_callback(ch, method, properties, body):
    """
    Callback function for processing incoming messages
    """
    try:
        message = json.loads(body)
        routing_key = method.routing_key
        
        logger.info(f"Received message with routing key {routing_key}: {message}")
        
        # Process message based on routing key
        if routing_key == 'product.stock_changed':
            # Example: Check if any pending orders can be fulfilled now
            product_id = message.get('product_id')
            new_stock = message.get('new_stock', 0)
            
            if product_id and new_stock > 0:
                # Find pending orders with this product
                order_items = OrderItem.objects.filter(
                    product_id=product_id,
                    order__status='PENDING'
                )
                
                for item in order_items:
                    if new_stock >= item.quantity:
                        # We can fulfill this order item
                        order = item.order
                        order.status = 'PROCESSING'
                        order.save()
                        
                        # Publish order updated event
                        publish_order_event('updated', {
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
                        })
                        
                        logger.info(f"Order #{order.id} status updated to PROCESSING")
                        
                        # Reduce available stock for next iteration
                        new_stock -= item.quantity
                        if new_stock <= 0:
                            break
        
        # Acknowledge message
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        # Reject message
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_consumer():
    """
    Start consuming messages from RabbitMQ
    """
    client = get_rabbitmq_client()
    
    # Order service is interested in product and user events
    queue_name = 'order_service_queue'
    routing_keys = ['product.stock_changed', 'product.updated', 'product.deleted', 'user.updated']
    
    client.consume(queue_name, routing_keys, message_callback)

def publish_order_event(event_type, order_data):
    """
    Publish order event to RabbitMQ
    
    Args:
        event_type (str): Type of event (created, updated, cancelled)
        order_data (dict): Order data to publish
    """
    client = get_rabbitmq_client()
    routing_key = f"order.{event_type}"
    
    return client.publish(routing_key, order_data)

# Function to start consumer in a separate thread
def start_consumer_thread():
    consumer_thread = threading.Thread(target=start_consumer)
    consumer_thread.daemon = True
    consumer_thread.start()
    logger.info("Started RabbitMQ consumer thread")