from django.db import models

class Order(models.Model):
    product_id = models.IntegerField()  # Thay vì ForeignKey, ta lưu ID của product từ product_service
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - Product {self.product_id}"

