# File: payment_service/apps/payments/apps.py

from django.apps import AppConfig

class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payments'

    def ready(self):
        from .rabbitmq import start_consumer_thread
        start_consumer_thread()