# File: product_service/apps/products/rabbitmq.py

import json
import threading
import logging
from django.conf import settings

# Import RabbitMQ utility (copy the RabbitMQClient class from above to this directory)
from .utils import get_rabbitmq_client
from .models import Product

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
        if routing_key == 'order.created':
            # Example: Update product stock when an order is created
            items = message.get('items', [])
            for item in items:
                product_id = item.get('product_id')
                quantity = item.get('quantity', 0)
                
                try:
                    product = Product.objects.get(id=product_id)
                    if product.stock >= quantity:
                        product.stock -= quantity
                        product.save()
                        logger.info(f"Updated stock for product {product.name} to {product.stock}")
                    else:
                        logger.error(f"Not enough stock for product {product.name}")
                except Product.DoesNotExist:
                    logger.error(f"Product with ID {product_id} not found")
        
        elif routing_key == 'order.cancelled':
            # Return stock when an order is cancelled
            items = message.get('items', [])
            for item in items:
                product_id = item.get('product_id')
                quantity = item.get('quantity', 0)
                
                try:
                    product = Product.objects.get(id=product_id)
                    product.stock += quantity
                    product.save()
                    logger.info(f"Returned stock for product {product.name} to {product.stock}")
                except Product.DoesNotExist:
                    logger.error(f"Product with ID {product_id} not found")
        
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
    
    # Product service is interested in order events
    queue_name = 'product_service_queue'
    routing_keys = ['order.created', 'order.updated', 'order.cancelled']
    
    client.consume(queue_name, routing_keys, message_callback)

def publish_product_event(event_type, product_data):
    """
    Publish product event to RabbitMQ
    
    Args:
        event_type (str): Type of event (created, updated, deleted, stock_changed)
        product_data (dict): Product data to publish
    """
    client = get_rabbitmq_client()
    routing_key = f"product.{event_type}"
    
    return client.publish(routing_key, product_data)

# Function to start consumer in a separate thread
def start_consumer_thread():
    consumer_thread = threading.Thread(target=start_consumer)
    consumer_thread.daemon = True
    consumer_thread.start()
    logger.info("Started RabbitMQ consumer thread")