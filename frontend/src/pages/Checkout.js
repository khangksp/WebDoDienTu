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

function Checkout() {
  const { t } = useLanguage();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // BACKEND INTEGRATION: Replace this with data fetched from your API/localStorage
  const [cartItems, setCartItems] = useState(location.state?.cartItems || [
    {

    }
  ]);
  
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
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

  // Handle order placement
  const placeOrder = () => {
    // BACKEND INTEGRATION: Send order to backend
    console.log('Placing order with:', {
      items: cartItems,
      address: selectedAddress,
      paymentMethod,
      totalAmount: grandTotal
    });
    
    alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
    // Navigate to confirmation or home page
    // navigate('/confirmation', { state: { orderData: { /* order details */ } } });
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
                  <div key={item.id} className={`order-item p-3 ${index < cartItems.length - 1 ? 'border-bottom' : ''}`}>
                    <div className="row align-items-center">
                    <div className="col-md-2">
                      <img 
                        src={item.image_url} // Sử dụng thuộc tính image_url theo API của bạn
                        alt={item.name} 
                        className="img-fluid order-item-image" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/placeholder.png'; // Fallback nếu hình ảnh lỗi
                        }}
                      />
                    </div>
                      
                      <div className="col-md-6">
                        <h6 className="item-name">{item.name}</h6>
                      </div>
                      
                      <div className="col-md-2 text-center">
                        <div className="item-quantity">x{item.quantity}</div>
                      </div>
                      
                      <div className="col-md-2 text-end">
                        <div className="item-price">{formatPrice(item.price * item.quantity)}</div>
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