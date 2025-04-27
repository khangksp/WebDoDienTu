from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DonHang, ChiTietDonHang, TrangThai
from .serializers import DonHangSerializer, ChiTietDonHangSerializer, CreateOrderSerializer

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
            # Sử dụng ID mặc định = 1 nếu không có
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
                    TenTrangThai="Chờ thanh toán",
                    defaults={'LoaiTrangThai': 'Đơn hàng'}
                )
                
                # Tính tổng tiền từ các sản phẩm
                total_amount = sum(item.get('price', 0) * item.get('quantity', 0) for item in data['items'])
                
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
                for item in data['items']:
                    ChiTietDonHang.objects.create(
                        MaDonHang=don_hang,
                        MaSanPham=item.get('id'),
                        SoLuong=item.get('quantity', 1),
                        GiaSanPham=item.get('price', 0),
                        TenSanPham=item.get('name', ''),
                        HinhAnh=item.get('image_url', '')
                    )
                
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