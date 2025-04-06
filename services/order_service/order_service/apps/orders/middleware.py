import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from django.http import JsonResponse
from functools import wraps


class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    # Trong middleware.py
    def __call__(self, request):
        if 'HTTP_AUTHORIZATION' in request.META:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            
            try:
                # Nếu header bắt đầu bằng "Bearer "
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                else:
                    # Nếu không, giả sử toàn bộ header là token
                    token = auth_header
                
                # Phương pháp 1: Giải mã JWT trực tiếp
                try:
                    import jwt
                    
                    payload = jwt.decode(
                        token, 
                        settings.JWT_SECRET, 
                        algorithms=[settings.JWT_ALGORITHM]
                    )
                    
                    # Lấy user_id từ payload
                    user_id = payload.get('user_id')
                    request.user_data = {'id': user_id}
                    
                    # Nếu giải mã thành công, không cần gọi API
                    print(f"Successfully authenticated user {user_id} via JWT")
                    
                except (jwt.PyJWTError, KeyError) as jwt_error:
                    print(f"JWT decoding failed: {str(jwt_error)}, trying API fallback")
                    
                    # Phương pháp 2: Gọi API của Auth Service
                    try:
                        # Sử dụng tên miền hợp lệ
                        session = requests.Session()
                        session.headers.update({
                            'Host': 'localhost',  
                            'Authorization': f'Bearer {token}'
                        })
                        
                        response = session.get(f"{settings.AUTH_SERVICE_URL}/api/auth/users/me/")
                        if response.status_code == 200:
                            request.user_data = response.json()
                            print(f"Successfully authenticated via API")
                        else:
                            print(f"API authentication failed: {response.status_code}")
                            request.user_data = None
                            
                    except requests.RequestException as req_error:
                        print(f"API request failed: {str(req_error)}")
                        request.user_data = None
                    
            except Exception as e:
                print(f"General error in authentication: {str(e)}")
                request.user_data = None
        else:
            print("No Authorization header found")
            request.user_data = None
            
        response = self.get_response(request)
        return response
    
def auth_required(view_func):
    @wraps(view_func)
    def wrapper(viewset, request, *args, **kwargs):  # Chú ý thứ tự tham số
        if not hasattr(request, 'user_data') or request.user_data is None:
            return JsonResponse({"message": "Authentication required"}, status=401)
        return view_func(viewset, request, *args, **kwargs)
    return wrapper

