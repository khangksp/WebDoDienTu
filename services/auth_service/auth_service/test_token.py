import os
import sys
import django

# Thiết lập đường dẫn project Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth_service.settings')

# Khởi tạo Django
django.setup()

import jwt
from django.conf import settings

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImtoYW5na3NwQGdtYWlsLmNvbSIsImV4cCI6MTc0MzcyNDg2Mn0.vHWjGUJWYZDJKMuB1IAQf4RCg4yn1x0epQN8ihj2vSo"

try:
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    print("Payload:", payload)
except jwt.ExpiredSignatureError:
    print("Token đã hết hạn")
except jwt.DecodeError:
    print("Token không hợp lệ")