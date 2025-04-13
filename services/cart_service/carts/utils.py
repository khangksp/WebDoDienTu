import json
import jwt
from django.conf import settings
from django.core.cache import cache
from rest_framework.exceptions import AuthenticationFailed

def get_cart_id(user_id):
    """
    Tạo ID giỏ hàng duy nhất cho mỗi người dùng
    """
    return f"cart:{user_id}"

def get_cart(user_id):
    """
    Lấy giỏ hàng của người dùng từ Redis
    """
    cart_id = get_cart_id(user_id)
    cart_data = cache.get(cart_id)
    if cart_data:
        return json.loads(cart_data)
    return {"items": [], "total": 0}

def save_cart(user_id, cart_data):
    """
    Lưu giỏ hàng vào Redis với thời gian hết hạn
    """
    cart_id = get_cart_id(user_id)
    cache.set(cart_id, json.dumps(cart_data), timeout=settings.CART_EXPIRY)

def add_to_cart(user_id, product_data, quantity=1):
    """
    Thêm sản phẩm vào giỏ hàng
    """
    cart = get_cart(user_id)
    
    # Lấy thông tin sản phẩm, hỗ trợ cả tên trường cũ và mới
    product_id = product_data.get('product_id')
    # Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    existing_item = next((item for item in cart['items'] if item['product_id'] == product_id), None)
    
    if existing_item:
        existing_item['quantity'] += quantity
    else:
        # Thêm mới với khả năng xử lý cả hai loại tên trường
        cart['items'].append({
            'product_id': product_id,
            'name': product_data.get('name', ''),
            'price': float(product_data.get('price', 0)),
            'image_url': product_data.get('image_url', ''),
            'quantity': quantity,
            'category': product_data.get('category', ''),
            'selected_color': product_data.get('selected_color', 'default'),
            'size': product_data.get('size', 'Standard')
        })
    
    # Cập nhật tổng tiền
    cart['total'] = sum(item['price'] * item['quantity'] for item in cart['items'])
    
    # Lưu giỏ hàng vào Redis
    save_cart(user_id, cart)
    
    return cart

def update_cart_quantity(user_id, product_id, quantity):
    """
    Cập nhật số lượng sản phẩm trong giỏ hàng
    """
    cart = get_cart(user_id)
    
    for item in cart['items']:
        if item['product_id'] == product_id:
            item['quantity'] = max(1, quantity)  # Đảm bảo số lượng ít nhất là 1
            break
    
    # Cập nhật tổng giá trị
    cart['total'] = sum(item['price'] * item['quantity'] for item in cart['items'])
    
    # Lưu giỏ hàng vào Redis
    save_cart(user_id, cart)
    
    return cart

def remove_from_cart(user_id, product_id):
    """
    Xóa sản phẩm khỏi giỏ hàng
    """
    cart = get_cart(user_id)
    
    cart['items'] = [item for item in cart['items'] if item['product_id'] != product_id]
    
    # Cập nhật tổng giá trị
    cart['total'] = sum(item['price'] * item['quantity'] for item in cart['items'])
    
    # Lưu giỏ hàng vào Redis
    save_cart(user_id, cart)
    
    return cart

def clear_cart(user_id):
    """
    Xóa toàn bộ giỏ hàng
    """
    cart_id = get_cart_id(user_id)
    cache.delete(cart_id)
    return {"items": [], "total": 0}

def get_user_id_from_token(token):
    """
    Giải mã JWT token để lấy user_id
    """
    try:
        if not token:
            raise AuthenticationFailed('Token không hợp lệ hoặc đã hết hạn')
            
        # Bỏ 'Bearer ' nếu có
        if token.startswith('Bearer '):
            token = token[7:]
        
        print(f"Processing token: {token[:10]}...") # Log để debug
            
        try:
            payload = jwt.decode(token, settings.JWT_AUTH['JWT_SECRET_KEY'], algorithms=[settings.JWT_AUTH['JWT_ALGORITHM']])
            return payload.get('user_id')
        except Exception as e:
            print(f"JWT decode error: {str(e)}")
            raise AuthenticationFailed(f'Lỗi giải mã token: {str(e)}')
    except Exception as e:
        print(f"Token processing error: {str(e)}")
        raise AuthenticationFailed(f'Token không hợp lệ: {str(e)}')