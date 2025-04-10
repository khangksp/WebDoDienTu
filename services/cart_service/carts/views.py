from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import (
    get_cart, add_to_cart, update_cart_quantity, 
    remove_from_cart, clear_cart, get_user_id_from_token
)

@api_view(['GET'])
def get_cart_view(request):
    """
    Lấy thông tin giỏ hàng của người dùng
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    
    try:
        user_id = get_user_id_from_token(auth_header)
        cart = get_cart(user_id)
        return Response(cart)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def add_to_cart_view(request):
    """
    Thêm sản phẩm vào giỏ hàng
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    print(f"Auth header received: {auth_header[:20]}...")
    
    try:
        user_id = get_user_id_from_token(auth_header)
        print(f"User ID from token: {user_id}")
        
        data = request.data
        print(f"Received data: {data}") 
        
        # Kiểm tra dữ liệu đầu vào
        product_id = data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Lấy dữ liệu sản phẩm từ request
        product_data = {
            'product_id': product_id,
            'name': data.get('name', ''),
            'price': data.get('price', 0),
            'image_url': data.get('image_url', ''),
            'category': data.get('category', ''),
            'selected_color': data.get('selected_color', 'default'),
            'size': data.get('size', 'Standard')
        }
        
        quantity = int(data.get('quantity', 1))
        
        # Thêm vào giỏ hàng
        cart = add_to_cart(user_id, product_data, quantity)
        
        return Response(cart)
    
    except Exception as e:
        print(f"Error in add_to_cart_view: {str(e)}") 
        return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PUT'])
def update_cart_view(request):
    """
    Cập nhật số lượng sản phẩm trong giỏ hàng
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    
    try:
        user_id = get_user_id_from_token(auth_header)
        data = request.data
        
        product_id = data.get('product_id')
        quantity = int(data.get('quantity', 1))
        
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        cart = update_cart_quantity(user_id, product_id, quantity)
        
        return Response(cart)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['DELETE'])
def remove_from_cart_view(request, product_id):
    """
    Xóa sản phẩm khỏi giỏ hàng
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    
    try:
        user_id = get_user_id_from_token(auth_header)
        
        cart = remove_from_cart(user_id, product_id)
        
        return Response(cart)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['DELETE'])
def clear_cart_view(request):
    """
    Xóa toàn bộ giỏ hàng
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    
    try:
        user_id = get_user_id_from_token(auth_header)
        
        cart = clear_cart(user_id)
        
        return Response(cart)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)