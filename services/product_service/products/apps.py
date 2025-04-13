# File: product_service/products/apps.py

from django.apps import AppConfig

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'
    
    def ready(self):
        # Chỉ import rabbitmq module, việc setup consumer đã được xử lý trong rabbitmq.py
        try:
            # Import module đúng đường dẫn
            import products.rabbitmq
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Lỗi khi import rabbitmq module: {e}")