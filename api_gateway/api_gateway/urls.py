from django.urls import path
from django.http import JsonResponse
import requests

# URL của các service
USER_SERVICE_URL = "http://127.0.0.1:8001/users/"
ORDER_SERVICE_URL = "http://127.0.0.1:8002/api/orders/"
PRODUCT_SERVICE_URL = "http://127.0.0.1:8003/api/products/"

def proxy_request(request, service_url, path=""):
    url = f"{service_url}{path}" if path else service_url
    print(f"🔗 Forwarding request to: {url}")  # Debug URL

    # Chỉ truyền các headers cần thiết, tránh lỗi
    headers = {key: value for key, value in request.headers.items() if key.lower() not in ['host', 'content-length']}

    try:
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            data=request.body
        )
        
        # Kiểm tra JSON hợp lệ
        data = response.json()
    except requests.exceptions.JSONDecodeError:
        data = {"error": "Invalid JSON response from backend"}

    return JsonResponse(data, status=response.status_code, safe=False)

urlpatterns = [
    path("users/", lambda req: proxy_request(req, USER_SERVICE_URL)),
    path("users/<path:path>", lambda req, path: proxy_request(req, USER_SERVICE_URL, path)),

    path("orders/", lambda req: proxy_request(req, ORDER_SERVICE_URL)),
    path("orders/<path:path>", lambda req, path: proxy_request(req, ORDER_SERVICE_URL, path)),

    path("products/", lambda req: proxy_request(req, PRODUCT_SERVICE_URL)),
    path("products/<path:path>", lambda req, path: proxy_request(req, PRODUCT_SERVICE_URL, path)),
]
