import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faEdit, 
  faCheckCircle, 
  faTruck, 
  faMoneyBill, 
  faCreditCard, 
  faWallet,
  faArrowLeft,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/checkout.css';

import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";

// Hàm giải mã JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Lỗi khi parse JWT:", e);
    return {};
  }
}

function Checkout() {
  const { t } = useLanguage();
  const { cart, clearCart } = useCart();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Kiểm tra xác thực khi vào trang
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      localStorage.setItem("redirect_after_login", window.location.pathname);
      alert('Vui lòng đăng nhập để tiếp tục thanh toán');
      navigate('/login');
    }
  }, [navigate]);
  
  // Sử dụng sản phẩm từ giỏ hàng hoặc từ location state
  const [cartItems, setCartItems] = useState([]);
  
  // Cập nhật cartItems khi cart thay đổi
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      setCartItems(cart.items);
    } else if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
    }
  }, [cart, location.state]);
  
  const [paymentMethod, setPaymentMethod] = useState(location.state?.paymentMethod || 'cash');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      isDefault: true,
      recipient: 'Nguyễn Văn A',
      phone: '0247056600',
      address: 'Tòa nhà VPBank Tower, Số 89 Láng Hạ, Phường Láng Hạ, Quận Đống Đa, Thành phố Hà Nội'
    },
    {
      id: 2,
      isDefault: false,
      recipient: 'Nguyễn Văn A',
      phone: '0987654321',
      address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh'
    }
  ]);
  
  const [selectedAddress, setSelectedAddress] = useState(addresses.find(a => a.isDefault) || addresses[0]);
  const [newAddress, setNewAddress] = useState({
    recipient: '',
    phone: '',
    address: '',
    isDefault: false
  });

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.GiaBan || item.price;
    return sum + price * item.quantity;
  }, 0);
  const shippingFee = 0; // Free shipping
  const grandTotal = totalPrice + shippingFee;

  // Get payment method name
  const getPaymentMethodName = (method) => {
    const methods = {
      'cash': { name: 'Tiền mặt', icon: faMoneyBill },
      'bank': { name: 'Chuyển khoản', icon: faCreditCard },
      'ewallet': { name: 'Ví điện tử', icon: faWallet }
    };
    return methods[method] || { name: 'Không xác định', icon: faMoneyBill };
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  // Handle address selection
  const selectAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  // Handle address form changes
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Add new address
  const addNewAddress = (e) => {
    e.preventDefault();
    const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
    const addressToAdd = {
      ...newAddress,
      id: newId
    };
    
    // If this is set as default, update other addresses
    let updatedAddresses = [...addresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
    }
    
    updatedAddresses.push(addressToAdd);
    setAddresses(updatedAddresses);
    
    // Select the new address if it's default or there was no address before
    if (newAddress.isDefault || !selectedAddress) {
      setSelectedAddress(addressToAdd);
    }
    
    // Reset form and close modal
    setNewAddress({
      recipient: '',
      phone: '',
      address: '',
      isDefault: false
    });
    setShowAddressModal(false);
  };

  // Hàm xử lý việc đặt hàng
  const placeOrder = async () => {
    if (!selectedAddress) {
      alert('Vui lòng chọn địa chỉ nhận hàng');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống, không thể đặt hàng');
      return;
    }
  
    try {
      // Lấy token xác thực từ localStorage
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        alert('Vui lòng đăng nhập để đặt hàng');
        localStorage.setItem("redirect_after_login", window.location.pathname);
        navigate('/login');
        return;
      }
      
      // Lấy user_id từ nhiều nguồn khác nhau
      // 1. Từ localStorage
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      let userId = userData.id || localStorage.getItem("user_id");
      
      // 2. Từ JWT token nếu không tìm thấy trong localStorage
      if (!userId) {
        const tokenPayload = parseJwt(token);
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.sub;
        console.log("Lấy user_id từ JWT token:", userId);
      }
      
      // 3. Thử gọi API để lấy thông tin user nếu vẫn không có
      if (!userId) {
        try {
          const userResponse = await fetch('http://localhost:8000/api/auth/users/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("Thông tin người dùng từ API:", userData);
            userId = userData.id || userData.user_id;
            localStorage.setItem("user_id", userId);
            localStorage.setItem("user_data", JSON.stringify(userData));
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
      }
      
      // 4. Nếu vẫn không có, đặt giá trị mặc định (có thể không hoạt động với backend)
      if (!userId) {
        userId = 1; // Giá trị mặc định - lưu ý điều này có thể không hoạt động với API của bạn
        console.warn("Không tìm thấy user_id, sử dụng giá trị mặc định:", userId);
      }
      
      // Log ra để debug
      console.log("User ID được sử dụng:", userId);
      console.log("Loại của User ID:", typeof userId);
  
      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        user_id: Number(userId), // Đảm bảo là số
        recipient_name: selectedAddress.recipient,
        phone_number: selectedAddress.phone,
        address: selectedAddress.address,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          id: item.product_id || item.id,
          TenSanPham: item.TenSanPham || item.name,
          GiaBan: item.GiaBan || item.price,
          quantity: item.quantity,
          HinhAnh_URL: item.HinhAnh_URL || item.image_url
        }))
      };
  
      console.log("Dữ liệu đơn hàng gửi đi:", orderData);
  
      // Gọi API tạo đơn hàng
      const response = await fetch('http://localhost:8000/api/orders/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
  
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        }
        
        try {
          const errorData = JSON.parse(responseText);
          console.error("Lỗi từ API:", errorData);
          throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
        } catch (e) {
          throw new Error(`Lỗi HTTP: ${response.status}`);
        }
      }
  
      const result = JSON.parse(responseText);
      console.log("Kết quả tạo đơn hàng:", result);
  
      // Xóa giỏ hàng sau khi đặt hàng thành công
      try {
        await clearCart(); // Sử dụng hàm clearCart từ CartContext
      } catch (cartError) {
        console.error("Lỗi khi xóa giỏ hàng:", cartError);
      }
  
      // Hiển thị thông báo và chuyển hướng
      alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
      
      // Chuyển hướng đến trang xác nhận đơn hàng
      navigate('/order-confirmation', { 
        state: { 
          orderId: result.order_id,
          totalAmount: result.total_amount
        } 
      });
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert(`Có lỗi xảy ra khi đặt hàng: ${error.message}`);
    }
  };

  // Go back to cart
  const goBackToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="checkout-container">
      <div className="container py-5">
        <div className="row">
          <div className="col-12 mb-4">
            {/* Fixed back button with improved styling */}
            <button 
              className="btn btn-outline-secondary px-4 py-2"
              onClick={goBackToCart}
              style={{ 
                fontSize: '16px', 
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500',
                marginTop: '40px'
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> 
              <span>{t('quayLaiGioHang')}</span>
            </button>
            <h2 className="checkout-title mt-3" style={
              { 
                margin: '0',
                padding: '0' 
              }}>{t('thanhToan')}</h2>
          </div>

          <div className="col-lg-8">
            {/* Shipping Address Section */}
            <div className="checkout-card mb-4">
              <div className="checkout-card-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="header-icon" />
                <h5>{t('diaChiNhanHang')}</h5>
                <button 
                  className="btn btn-sm ms-auto custom-hover"
                  onClick={() => setShowAddressModal(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-1" /> {t('thayDoi')}
                </button>
              </div>
              
              <div className="checkout-card-body">
                {selectedAddress ? (
                  <div className="selected-address">
                    <div className="recipient">
                      <span className="fw-bold">{selectedAddress.recipient}</span>
                      <span className="text-divider">|</span>
                      <span>{selectedAddress.phone}</span>
                      {selectedAddress.isDefault && (
                        <span className="default-badge ms-2">{t('macDinh')}</span>
                      )}
                    </div>
                    <div className="address-text mt-2">
                      {selectedAddress.address}
                    </div>
                  </div>
                ) : (
                  <div className="no-address">
                    <p>{t('banChuaCoDiaChi')}</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddressModal(true)}
                    >
                      {t('themDiaChi')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="checkout-card mb-4">
              <div className="checkout-card-header">
                <FontAwesomeIcon icon={getPaymentMethodName(paymentMethod).icon} className="header-icon" />
                <h5>{t('phuongThucThanhToan')}</h5>
              </div>
              
              <div className="checkout-card-body">
                <div className="payment-method-info">
                  <div className="method-icon-container">
                    <FontAwesomeIcon icon={getPaymentMethodName(paymentMethod).icon} />
                  </div>
                  <div className="method-details">
                    <p className="mb-0">{getPaymentMethodName(paymentMethod).name}</p>
                    <small className="text-muted">
                      {paymentMethod === 'cash' && 'Thanh toán khi nhận hàng (COD)'}
                      {paymentMethod === 'bank' && 'Chuyển khoản qua ngân hàng'}
                      {paymentMethod === 'ewallet' && 'Thanh toán qua ví MoMo, ZaloPay, VNPay'}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="checkout-card mb-4">
              <div className="checkout-card-header">
                <FontAwesomeIcon icon={faShoppingBag} className="header-icon" />
                <h5>{t('donHangCuaBan')} ({cartItems.length} {t('sp')})</h5>
              </div>
              
              <div className="checkout-card-body p-0">
                {cartItems.map((item, index) => (
                  <div key={item.id || item.product_id} className={`order-item p-3 ${index < cartItems.length - 1 ? 'border-bottom' : ''}`}>
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        <img 
                          src={item.HinhAnh_URL || item.image_url} 
                          alt={item.TenSanPham || item.name} 
                          className="img-fluid order-item-image" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/placeholder.png';
                          }}
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <h6 className="item-name">{item.TenSanPham || item.name}</h6>
                      </div>
                      
                      <div className="col-md-2 text-center">
                        <div className="item-quantity">x{item.quantity}</div>
                      </div>
                      
                      <div className="col-md-2 text-end">
                        <div className="item-price">{formatPrice((item.GiaBan || item.price) * item.quantity)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="checkout-card mb-4">
              <div className="checkout-card-header">
                <FontAwesomeIcon icon={faTruck} className="header-icon" />
                <h5>{t('thongTinVanChuyen')}</h5>
              </div>
              
              <div className="checkout-card-body">
                <div className="shipping-info">
                  <p className="mb-1">{t('phuongThucVanChuyen')}</p>
                  <p className="mb-1">{t('thoiGianVanChuyen')}</p>
                  <p className="mb-0">{t('phiVanChuyen')} {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Order Summary Card */}
            <div className="checkout-card summary-card">
              <div className="checkout-card-header">
                <h5>{t('tongCong')}</h5>
              </div>
              
              <div className="checkout-card-body">
                <div className="summary-item d-flex justify-content-between">
                  <span>{t('tamTinh')}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="summary-item d-flex justify-content-between">
                  <span>{t('phiVanChuyen')}</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                </div>
                
                <hr />
                
                <div className="summary-total d-flex justify-content-between">
                  <span className="fw-bold">{t('tongTien')}</span>
                  <span className="fw-bold text-danger">{formatPrice(grandTotal)}</span>
                </div>
                
                <button 
                  className="btn btn-danger btn-place-order w-100 mt-4"
                  onClick={placeOrder}
                >
                  {t('datHang')}
                </button>
                
                <div className="order-note mt-3">
                  <p className="mb-0 text-muted small">{t('bangCach')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-backdrop">
          <div className="modal-wrapper">
            <div className="address-modal">
              <div className="modal-header">
                <h5>{t('diaChiNhanHang')}</h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowAddressModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="address-list">
                  <h6 className="mb-3">{t('diaChiDaLuu')}</h6>
                  
                  {addresses.length > 0 ? (
                    addresses.map(address => (
                      <div 
                        key={address.id} 
                        className={`address-option ${selectedAddress && address.id === selectedAddress.id ? 'selected' : ''}`}
                        onClick={() => selectAddress(address)}
                      >
                        <div className="recipient">
                          <span className="fw-bold">{address.recipient}</span>
                          <span className="text-divider">|</span>
                          <span>{address.phone}</span>
                          {address.isDefault && (
                            <span className="default-badge ms-2">{t('macDinh')}</span>
                          )}
                        </div>
                        <div className="address-text mt-2">
                          {address.address}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>{t('chuaCoDiaChiDuocLuu')}</p>
                  )}
                </div>
                
                <hr />
                
                <div className="new-address-form">
                  <h6 className="mb-3">{t('themDiaChiMoi')}</h6>
                  
                  <form onSubmit={addNewAddress}>
                    <div className="mb-3">
                      <label htmlFor="recipient" className="form-label">{t('hoTenNguoiNhan')}</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="recipient" 
                        name="recipient"
                        value={newAddress.recipient}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">{t('soDienThoai')}</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        id="phone" 
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">{t('diaChiDayDu')}</label>
                      <textarea 
                        className="form-control" 
                        id="address" 
                        name="address"
                        rows="3"
                        value={newAddress.address}
                        onChange={handleAddressChange}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="mb-3 form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="isDefault" 
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={handleAddressChange}
                      />
                      <label className="form-check-label" htmlFor="isDefault">{t('datLamDiaChiMacDinh')}</label>
                    </div>
                    
                    <div className="modal-footer justify-content-between">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setShowAddressModal(false)}
                      >
                        {t('huy')}
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                      >
                        {t('luuDiaChi')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;