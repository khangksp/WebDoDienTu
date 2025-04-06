# File: auth_service/apps/users/rabbitmq.py

import json
import threading
import logging
from django.conf import settings

# Import RabbitMQ utility (copy the RabbitMQClient class from above to this directory)
from .utils import get_rabbitmq_client
from .models import User

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
            # Example: Update user stats when an order is created
            user_id = message.get('user_id')
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    # Update user stats if needed
                    logger.info(f"Updated stats for user {user.email}")
                except User.DoesNotExist:
                    logger.error(f"User with ID {user_id} not found")
        
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
    
    # Auth service is interested in order events
    queue_name = 'auth_service_queue'
    routing_keys = ['order.created', 'order.updated', 'order.cancelled']
    
    client.consume(queue_name, routing_keys, message_callback)

def publish_user_event(event_type, user_data):
    """
    Publish user event to RabbitMQ
    
    Args:
        event_type (str): Type of event (created, updated, deleted)
        user_data (dict): User data to publish
    """
    client = get_rabbitmq_client()
    routing_key = f"user.{event_type}"
    
    return client.publish(routing_key, user_data)

# Function to start consumer in a separate thread
def start_consumer_thread():
    consumer_thread = threading.Thread(target=start_consumer)
    consumer_thread.daemon = True
    consumer_thread.start()
    logger.info("Started RabbitMQ consumer thread")