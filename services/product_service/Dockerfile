# Sử dụng Python 3.10 làm nền tảng
FROM python:3.10

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép tất cả code vào container
COPY . .

# Cài đặt thư viện Python từ file requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Chạy Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8003"]
