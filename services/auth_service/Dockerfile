# Use Python 3.9 slim image as the base
FROM python:3.9-slim

# Install system dependencies required for mysqlclient
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire auth_service directory
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run migrations and start the server
CMD ["sh", "-c", "python manage.py migrate && gunicorn auth_service.wsgi:application --bind 0.0.0.0:8000"]