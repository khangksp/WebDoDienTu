from django.urls import path
from django.http import JsonResponse
import requests

# URL của các service
USER_SERVICE_URL = "http://127.0.0.1:8001/users/"
ORDER_SERVICE_URL = "http://127.0.0.1:8002/orders/"
PRODUCT_SERVICE_URL = "http://127.0.0.1:8003/products/"

def proxy_request(request, service_url, path=""):
    url = f"{service_url}{path}"
    response = requests.request(
        method=request.method,
        url=url,
        headers=request.headers,
        data=request.body
    )
    return JsonResponse(response.json(), status=response.status_code)

urlpatterns = [
    path("users/<path:path>", lambda req, path: proxy_request(req, USER_SERVICE_URL, path)),
    path("orders/<path:path>", lambda req, path: proxy_request(req, ORDER_SERVICE_URL, path)),
    path("products/<path:path>", lambda req, path: proxy_request(req, PRODUCT_SERVICE_URL, path)),
]
