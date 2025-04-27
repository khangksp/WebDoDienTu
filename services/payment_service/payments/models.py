from django.db import models

class Payment(models.Model):
    pk_MaThanhToan = models.AutoField(primary_key=True)
    fk_MaDonHang = models.ForeignKey('Order', on_delete=models.CASCADE, db_column='fk_MaDonHang')
    PhuongThucThanhToan = models.CharField(max_length=50)
    NgayThanhToan = models.DateTimeField(auto_now_add=True)
    TrangThaiThanhToan = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ])

    class Meta:
        db_table = 'payment'

    def __str__(self):
        return f"Payment {self.pk_MaThanhToan} - {self.TrangThaiThanhToan}"
