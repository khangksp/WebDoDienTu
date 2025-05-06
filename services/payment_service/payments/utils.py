# File: payment_service/apps/payments/utils.py

import pika
import logging

logger = logging.getLogger(__name__)

class RabbitMQClient:
    def __init__(self):
        self.connection_params = pika.ConnectionParameters(
            host='rabbitmq',
            port=5672,
            credentials=pika.PlainCredentials('guest', 'guest')
        )
        self.connection = None
        self.channel = None

    def connect(self):
        self.connection = pika.BlockingConnection(self.connection_params)
        self.channel = self.connection.channel()
        self.channel.exchange_declare(
            exchange='microservice_events',
            exchange_type='topic',
            durable=True
        )
        logger.info("Connected to RabbitMQ successfully")
        return True

    def consume(self, queue_name, routing_keys, callback):
        if not self.connection or self.connection.is_closed:
            self.connect()

        # Declare queue
        self.channel.queue_declare(queue=queue_name, durable=True)

        # Bind queue to routing keys
        for routing_key in routing_keys:
            self.channel.queue_bind(
                queue=queue_name,
                exchange='microservice_events',
                routing_key=routing_key
            )

        # Set up consumer
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback
        )

        logger.info(f"Started consuming from queue {queue_name} with routing keys {routing_keys}")
        self.channel.start_consuming()

    def close(self):
        if self.channel:
            self.channel.close()
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        logger.info("Closed RabbitMQ connection")

def get_rabbitmq_client():
    return RabbitMQClient()