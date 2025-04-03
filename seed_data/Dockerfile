FROM python:3.9-slim

WORKDIR /app

# Cài đặt các gói phụ thuộc cho MySQLClient
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "seed.py"]