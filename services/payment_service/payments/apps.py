class PaymentServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payment_service'

    def ready(self):
        import payment_service.payments  # <-- dòng này rất quan trọng
