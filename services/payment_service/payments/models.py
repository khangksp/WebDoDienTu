from django.db import models

class ThanhToan(models.Model):
    pk_MaThanhToan = models.AutoField(primary_key=True)
    fk_MaDonHang = models.IntegerField()
    PhuongThucThanhToan = models.CharField(max_length=100)
    NgayThanhToan = models.DateField()
    TrangThaiThanhToan = models.CharField(max_length=50)

    def __str__(self):
        return f"Thanh toán {self.pk_MaThanhToan}"
