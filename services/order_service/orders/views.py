from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .rabbitmq import publish_order_event
from .models import DonHang, ChiTietDonHang, TrangThai
from .serializers import DonHangSerializer, ChiTietDonHangSerializer, CreateOrderSerializer
from django.db.models import Sum, Count  # Add these imports
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def count_orders(request):
    """API đếm tổng số đơn hàng"""
    try:
        total_orders = DonHang.objects.count()
        return Response({
            'status': 'success',
            'total_orders': total_orders
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Lỗi khi đếm đơn hàng: {str(e)}", exc_info=True)
        return Response({
            'status': 'error',
            'message': f'Lỗi khi đếm đơn hàng: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([AllowAny])
def list_orders(request):
    """API lấy danh sách tất cả đơn hàng"""
    try:
        orders = DonHang.objects.all().order_by('-NgayDatHang')
        serializer = DonHangSerializer(orders, many=True)
        return Response({
            'status': 'success',
            'orders': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Lỗi khi lấy danh sách đơn hàng: {str(e)}", exc_info=True)
        return Response({
            'status': 'error',
            'message': f'Lỗi khi lấy danh sách đơn hàng: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_order_info(request, user_id):
    """
    API lấy thông tin tổng quan về các đơn hàng của một người dùng
    
    Parameters:
    - user_id: ID của người dùng
    
    Returns:
    - Tổng số đơn hàng
    - Tổng số tiền đã đặt hàng
    - Chi tiết các đơn hàng
    """
    try:
        # Lọc các đơn hàng của người dùng
        orders = DonHang.objects.filter(MaNguoiDung=user_id).order_by('-NgayDatHang')
        
        # Tính tổng số đơn hàng
        total_orders = orders.count()
        
        # Tính tổng số tiền từ tất cả các đơn hàng
        total_amount = orders.aggregate(total=Sum('TongTien'))['total'] or 0.0
        
        # Serialize các đơn hàng
        orders_serializer = DonHangSerializer(orders, many=True)
        
        # Phân nhóm đơn hàng theo trạng thái
        order_status_summary = orders.values('MaTrangThai__TenTrangThai').annotate(
            count=Count('MaDonHang'),
            total_amount=Sum('TongTien')
        )
        
        # Chuyển đổi các giá trị total_amount trong order_status_summary thành float
        order_status_summary_list = []
        for summary in order_status_summary:
            summary_dict = dict(summary)
            summary_dict['total_amount'] = float(summary_dict['total_amount']) if summary_dict['total_amount'] is not None else 0.0
            order_status_summary_list.append(summary_dict)
        
        return Response({
            'status': 'success',
            'total_orders': total_orders,
            'total_amount': float(total_amount),
            'orders': orders_serializer.data,
            'order_status_summary': order_status_summary_list
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Lỗi khi lấy thông tin đơn hàng theo user ID: {str(e)}", exc_info=True)
        return Response({
            'status': 'error',
            'message': f'Lỗi khi lấy thông tin đơn hàng: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class DonHangViewSet(viewsets.ModelViewSet):
    queryset = DonHang.objects.all()
    serializer_class = DonHangSerializer

    def get_queryset(self):
        """Lọc đơn hàng theo người dùng nếu có tham số user_id"""
        queryset = DonHang.objects.all()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(MaNguoiDung=user_id)
        return queryset

class CreateOrderView(APIView):
    """API View để tạo đơn hàng mới từ giỏ hàng"""
    
    def post(self, request):
        logger.info(f"Nhận request tạo đơn hàng: {request.data}")
        
        # Kiểm tra xác thực
        token_user_id = getattr(request.user, 'id', None)
        logger.info(f"User ID từ token: {token_user_id}")
        
        # Clone request.data để có thể sửa đổi
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Thêm user_id từ token nếu không có trong request hoặc là null
        if (not data.get('user_id') or data.get('user_id') is None) and token_user_id:
            data['user_id'] = token_user_id
            logger.info(f"Sử dụng user_id từ token: {token_user_id}")
        elif not data.get('user_id') or data.get('user_id') is None:
            data['user_id'] = 1
            logger.info("Không tìm thấy user_id, sử dụng giá trị mặc định: 1")
        
        # Chuyển đổi user_id thành số nếu là chuỗi
        if 'user_id' in data and not isinstance(data['user_id'], int):
            try:
                data['user_id'] = int(data['user_id'])
                logger.info(f"Chuyển đổi user_id thành int: {data['user_id']}")
            except (ValueError, TypeError):
                data['user_id'] = 1
                logger.info("Không thể chuyển đổi user_id thành int, sử dụng giá trị mặc định: 1")
        
        serializer = CreateOrderSerializer(data=data)
        
        if serializer.is_valid():
            data = serializer.validated_data
            logger.info(f"Dữ liệu hợp lệ: {data}")
            
            try:
                # Lấy hoặc tạo trạng thái "Chờ thanh toán"
                trang_thai, created = TrangThai.objects.get_or_create(
                    TenTrangThai="Đang xử lý",
                    defaults={'LoaiTrangThai': 'Đơn hàng'}
                )
                # Tính tổng tiền từ các sản phẩm - SỬA LỖI Ở ĐÂY
                total_amount = 0
                for item in data['items']:
                    # Kiểm tra các trường có thể chứa giá
                    price = None
                    if 'price' in item:
                        price = item.get('price')
                    elif 'GiaBan' in item:
                        price = item.get('GiaBan')
                    elif 'GiaSanPham' in item:
                        price = item.get('GiaSanPham')
                    
                    quantity = item.get('quantity')
                    
                    # Kiểm tra giá trị price và quantity phải hợp lệ
                    if price is not None and quantity is not None:
                        item_total = price * quantity
                        total_amount += item_total
                        logger.info(f"Sản phẩm: {item.get('name', item.get('TenSanPham', 'N/A'))}, Giá: {price}, SL: {quantity}, Thành tiền: {item_total}")
                    else:
                        logger.warning(f"Thiếu thông tin giá hoặc số lượng cho sản phẩm: {item}")
                
                logger.info(f"Tổng tiền đơn hàng: {total_amount}")
                
                # Tạo đơn hàng
                don_hang = DonHang.objects.create(
                    MaNguoiDung=data['user_id'],
                    MaTrangThai=trang_thai,
                    TongTien=total_amount,
                    DiaChi=data['address'],
                    TenNguoiNhan=data['recipient_name'],
                    SoDienThoai=data['phone_number'],
                    PhuongThucThanhToan=data['payment_method']
                )
                
                # Tạo chi tiết đơn hàng
                chi_tiet_items = []
                for item in data['items']:
                    # Lấy giá từ các trường có thể
                    price = item.get('price', item.get('GiaBan', item.get('GiaSanPham', 0)))
                    
                    # Lấy tên sản phẩm từ các trường có thể
                    ten_san_pham = item.get('name', item.get('TenSanPham', ''))
                    
                    # Lấy URL hình ảnh từ các trường có thể
                    hinh_anh = item.get('image_url', item.get('HinhAnh_URL', ''))
                    
                    chi_tiet = ChiTietDonHang.objects.create(
                        MaDonHang=don_hang,
                        MaSanPham=item.get('id'),
                        SoLuong=item.get('quantity', 1),
                        GiaSanPham=price,
                        TenSanPham=ten_san_pham,
                        HinhAnh=hinh_anh
                    )
                    chi_tiet_items.append({
                        'product_id': chi_tiet.MaSanPham,
                        'quantity': chi_tiet.SoLuong
                    })
                
                # Gửi sự kiện order.created lên RabbitMQ
                order_data = {
                    'order_id': don_hang.MaDonHang,
                    'user_id': don_hang.MaNguoiDung,
                    'status': don_hang.MaTrangThai.TenTrangThai,
                    'total_amount': float(don_hang.TongTien),
                    'payment_method': don_hang.PhuongThucThanhToan,
                    'recipient_name': don_hang.TenNguoiNhan,
                    'phone_number': don_hang.SoDienThoai,
                    'address': don_hang.DiaChi,
                    'items': chi_tiet_items
                }
                publish_order_event('created', order_data)
                logger.info(f"Đã gửi sự kiện order.created cho đơn hàng #{don_hang.MaDonHang}")
                
                # Trả về kết quả
                return Response({
                    'order_id': don_hang.MaDonHang,
                    'status': 'success',
                    'message': 'Đơn hàng đã được tạo thành công',
                    'total_amount': don_hang.TongTien
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Lỗi khi tạo đơn hàng: {str(e)}", exc_info=True)
                return Response({
                    'status': 'error',
                    'message': f'Lỗi khi tạo đơn hàng: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        logger.warning(f"Lỗi dữ liệu đầu vào: {serializer.errors}")
        return Response({
            'status': 'error',
            'message': 'Dữ liệu không hợp lệ',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['GET'])
def get_user_orders(request, user_id):
    """Lấy danh sách đơn hàng của một người dùng cụ thể"""
    orders = DonHang.objects.filter(MaNguoiDung=user_id).order_by('-NgayDatHang')
    serializer = DonHangSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_order_details(request, order_id):
    """Lấy chi tiết một đơn hàng cụ thể"""
    try:
        order = DonHang.objects.get(MaDonHang=order_id)
        order_data = DonHangSerializer(order).data
        
        # Lấy chi tiết các sản phẩm trong đơn hàng
        order_items = ChiTietDonHang.objects.filter(MaDonHang=order)
        order_items_data = ChiTietDonHangSerializer(order_items, many=True).data
        
        return Response({
            'order': order_data,
            'items': order_items_data
        })
    except DonHang.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Đơn hàng không tồn tại'
        }, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_order_status(request, order_id):
    """
    API để cập nhật trạng thái của một đơn hàng
    
    Parameters:
    - order_id: ID của đơn hàng
    - Body: { "MaTrangThai": <integer> } (ví dụ: { "MaTrangThai": 2 })
    
    Returns:
    - Thông tin đơn hàng đã cập nhật
    """
    try:
        # Lấy đơn hàng
        order = DonHang.objects.get(MaDonHang=order_id)
        
        # Lấy trạng thái từ body request
        new_status_id = request.data.get('MaTrangThai')
        if not new_status_id:
            return Response({
                'status': 'error',
                'message': 'Vui lòng cung cấp MaTrangThai'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Kiểm tra trạng thái có tồn tại
        try:
            new_status = TrangThai.objects.get(MaTrangThai=new_status_id)
        except TrangThai.DoesNotExist:
            return Response({
                'status': 'error',
                'message': f'Trạng thái với MaTrangThai={new_status_id} không tồn tại'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cập nhật trạng thái đơn hàng
        old_status = order.MaTrangThai.TenTrangThai
        order.MaTrangThai = new_status
        order.save()
        
        # Gửi sự kiện order.status_updated lên RabbitMQ
        order_data = {
            'order_id': order.MaDonHang,
            'user_id': order.MaNguoiDung,
            'old_status': old_status,
            'new_status': new_status.TenTrangThai,
            'total_amount': float(order.TongTien),
            'payment_method': order.PhuongThucThanhToan,
            'recipient_name': order.TenNguoiNhan,
            'phone_number': order.SoDienThoai,
            'address': order.DiaChi,
        }
        publish_order_event('status_updated', order_data)
        logger.info(f"Đã gửi sự kiện order.status_updated cho đơn hàng #{order.MaDonHang}")
        
        # Serialize đơn hàng để trả về
        serializer = DonHangSerializer(order)
        
        return Response({
            'status': 'success',
            'message': f'Cập nhật trạng thái đơn hàng #{order_id} thành {new_status.TenTrangThai}',
            'order': serializer.data
        }, status=status.HTTP_200_OK)
    
    except DonHang.DoesNotExist:
        logger.error(f"Đơn hàng #{order_id} không tồn tại")
        return Response({
            'status': 'error',
            'message': f'Đơn hàng #{order_id} không tồn tại'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Lỗi khi cập nhật trạng thái đơn hàng #{order_id}: {str(e)}", exc_info=True)
        return Response({
            'status': 'error',
            'message': f'Lỗi khi cập nhật trạng thái đơn hàng: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)