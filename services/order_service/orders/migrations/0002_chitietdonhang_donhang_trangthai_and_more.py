# Generated by Django 4.0.4 on 2025-04-11 09:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ChiTietDonHang',
            fields=[
                ('MaChiTietDonHang', models.AutoField(primary_key=True, serialize=False)),
                ('MaSanPham', models.IntegerField()),
                ('SoLuong', models.IntegerField()),
                ('GiaSanPham', models.DecimalField(decimal_places=0, max_digits=9)),
                ('TenSanPham', models.CharField(max_length=255)),
                ('HinhAnh', models.URLField(blank=True, null=True)),
            ],
            options={
                'db_table': 'ChiTietDonHang',
            },
        ),
        migrations.CreateModel(
            name='DonHang',
            fields=[
                ('MaDonHang', models.AutoField(primary_key=True, serialize=False)),
                ('MaNguoiDung', models.IntegerField()),
                ('NgayDatHang', models.DateTimeField(auto_now_add=True)),
                ('TongTien', models.DecimalField(decimal_places=0, max_digits=9)),
                ('DiaChi', models.TextField()),
                ('TenNguoiNhan', models.CharField(max_length=100)),
                ('SoDienThoai', models.CharField(max_length=15)),
                ('PhuongThucThanhToan', models.CharField(max_length=50)),
            ],
            options={
                'db_table': 'DonHang',
            },
        ),
        migrations.CreateModel(
            name='TrangThai',
            fields=[
                ('MaTrangThai', models.AutoField(primary_key=True, serialize=False)),
                ('TenTrangThai', models.CharField(max_length=50)),
                ('LoaiTrangThai', models.CharField(max_length=30)),
            ],
            options={
                'db_table': 'TrangThai',
            },
        ),
        migrations.RemoveField(
            model_name='orderitem',
            name='order',
        ),
        migrations.DeleteModel(
            name='Order',
        ),
        migrations.DeleteModel(
            name='OrderItem',
        ),
        migrations.AddField(
            model_name='donhang',
            name='MaTrangThai',
            field=models.ForeignKey(db_column='MaTrangThai', on_delete=django.db.models.deletion.RESTRICT, to='orders.trangthai'),
        ),
        migrations.AddField(
            model_name='chitietdonhang',
            name='MaDonHang',
            field=models.ForeignKey(db_column='MaDonHang', on_delete=django.db.models.deletion.CASCADE, related_name='chi_tiet', to='orders.donhang'),
        ),
    ]
