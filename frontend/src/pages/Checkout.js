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
  import axios from 'axios';
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
    
    // Lấy thông tin người dùng từ localStorage
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const nguoiDungData = userData.nguoidung_data || {};

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

    // Khởi tạo địa chỉ từ nguoiDungData
    const [selectedAddress, setSelectedAddress] = useState({
      id: 1,
      isDefault: true,
      recipient: nguoiDungData.tennguoidung || '',
      phone: nguoiDungData.sodienthoai || '',
      address: nguoiDungData.diachi || ''
    });

    // Trạng thái cho form chỉnh sửa địa chỉ
    const [editAddress, setEditAddress] = useState({
      recipient: nguoiDungData.tennguoidung || '',
      phone: nguoiDungData.sodienthoai || '',
      address: nguoiDungData.diachi || ''
    });

    // Trạng thái cho dropdown Tỉnh/Huyện/Xã
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');

    // Lấy danh sách tỉnh
    useEffect(() => {
      const fetchProvinces = async () => {
        try {
          const response = await fetch('https://provinces.open-api.vn/api/p/');
          const data = await response.json();
          setProvinces(data);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách tỉnh:', error);
        }
      };
      fetchProvinces();
    }, []);

    // Lấy danh sách huyện khi chọn tỉnh
    useEffect(() => {
      if (selectedProvince) {
        const fetchDistricts = async () => {
          try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts || []);
            setWards([]);
            setSelectedDistrict('');
            setSelectedWard('');
          } catch (error) {
            console.error('Lỗi khi lấy danh sách huyện:', error);
          }
        };
        fetchDistricts();
      }
    }, [selectedProvince]);

    // Lấy danh sách xã khi chọn huyện
    useEffect(() => {
      if (selectedDistrict) {
        const fetchWards = async () => {
          try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
            const data = await response.json();
            setWards(data.wards || []);
            setSelectedWard('');
          } catch (error) {
            console.error('Lỗi khi lấy danh sách xã:', error);
          }
        };
        fetchWards();
      }
    }, [selectedDistrict]);

    // Tự động điền địa chỉ khi chọn xã
    useEffect(() => {
      if (selectedWard) {
        const provinceName = provinces.find(p => p.code === parseInt(selectedProvince))?.name || '';
        const districtName = districts.find(d => d.code === parseInt(selectedDistrict))?.name || '';
        const wardName = wards.find(w => w.code === parseInt(selectedWard))?.name || '';
        const fullAddress = `${wardName}, ${districtName}, ${provinceName}`;
        setEditAddress(prev => ({ ...prev, address: fullAddress }));
      }
    }, [selectedWard, provinces, districts, wards]);

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

    // Handle address form changes
    const handleAddressChange = (e) => {
      const { name, value } = e.target;
      setEditAddress(prev => ({ ...prev, [name]: value }));
    };

    // Update addressconst [isLoading, setIsLoading] = useState(false);

  // Trong component Checkout// Đảm bảo bạn đã import axios


  // Trong component Checkout
  const updateAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token || !userData?.mataikhoan) {
      alert(t("vuiLongDangNhap"));
      navigate('/login');
      return;
    }
  
    try {
      const response = await axios.put(
        `http://localhost:8000/api/auth/users/update/${userData.mataikhoan}/`,
        {
          nguoidung: {
            tennguoidung: editAddress.recipient,
            email: nguoiDungData.email,
            sodienthoai: editAddress.phone,
            diachi: editAddress.address,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.data.status === "ok") {
        // Cập nhật userData từ response
        const updatedUser = response.data.user;
  
        // Cập nhật localStorage
        const updatedUserData = {
          ...userData,
          nguoidung_data: {
            ...userData.nguoidung_data,
            tennguoidung: updatedUser.nguoidung_data?.tennguoidung || editAddress.recipient,
            sodienthoai: updatedUser.nguoidung_data?.sodienthoai || editAddress.phone,
            diachi: updatedUser.nguoidung_data?.diachi || editAddress.address,
            email: updatedUser.nguoidung_data?.email || nguoiDungData.email,
          },
        };
        localStorage.setItem("user_data", JSON.stringify(updatedUserData));
        localStorage.setItem("tennguoidung", updatedUser.nguoidung_data?.tennguoidung || editAddress.recipient);
        localStorage.setItem("sodienthoai", updatedUser.nguoidung_data?.sodienthoai || editAddress.phone);
        localStorage.setItem("diachi", updatedUser.nguoidung_data?.diachi || editAddress.address);
  
        // Cập nhật selectedAddress
        setSelectedAddress({
          id: 1,
          isDefault: true,
          recipient: updatedUser.nguoidung_data?.tennguoidung || editAddress.recipient,
          phone: updatedUser.nguoidung_data?.sodienthoai || editAddress.phone,
          address: updatedUser.nguoidung_data?.diachi || editAddress.address,
        });
  
        // Đóng modal và thông báo thành công
        setShowAddressModal(false);
        alert(t("capNhatThanhCong"));
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật địa chỉ:', error);
      const errorMsg = error.response?.data?.message || t("capNhatThatBai");
      alert(errorMsg);
    }
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
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          alert('Vui lòng đăng nhập để đặt hàng');
          localStorage.setItem("redirect_after_login", window.location.pathname);
          navigate('/login');
          return;
        }
        
        let userId = userData.mataikhoan;
        
        if (!userId) {
          const tokenPayload = parseJwt(token);
          userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.sub;
          console.log("Lấy user_id từ JWT token:", userId);
        }
        
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
        
        if (!userId) {
          userId = 1;
          console.warn("Không tìm thấy user_id, sử dụng giá trị mặc định:", userId);
        }
        
        console.log("User ID được sử dụng:", userId);
        console.log("Loại của User ID:", typeof userId);
    
        const orderData = {
          user_id: Number(userId),
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
    
        try {
          await clearCart();
        } catch (cartError) {
          console.error("Lỗi khi xóa giỏ hàng:", cartError);
        }
    
        alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
        
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
              <h2 className="checkout-title mt-3" style={{ margin: '0', padding: '0' }}>{t('thanhToan')}</h2>
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
                    <h6 className="mb-3">{t('diaChiHienTai')}</h6>
                    {selectedAddress ? (
                      <div className="address-option selected">
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
                      <p>{t('chuaCoDiaChiDuocLuu')}</p>
                    )}
                  </div>
                  
                  <hr />
                  
                  <div className="edit-address-form">
                    <h6 className="mb-3">{t('chinhSuaDiaChi')}</h6>
                    
                    <form onSubmit={updateAddress}>
                      <div className="mb-3">
                        <label htmlFor="recipient" className="form-label">{t('hoTenNguoiNhan')}</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="recipient" 
                          name="recipient"
                          value={editAddress.recipient}
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
                          value={editAddress.phone}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="province" className="form-label">{t('tinhThanhPho')}</label>
                        <select
                          className="form-control"
                          id="province"
                          value={selectedProvince}
                          onChange={(e) => setSelectedProvince(e.target.value)}
                          required
                        >
                          <option value="">{t('chonTinh')}</option>
                          {provinces.map(province => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="district" className="form-label">{t('quanHuyen')}</label>
                        <select
                          className="form-control"
                          id="district"
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          required
                          disabled={!selectedProvince}
                        >
                          <option value="">{t('chonHuyen')}</option>
                          {districts.map(district => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="ward" className="form-label">{t('xaPhuong')}</label>
                        <select
                          className="form-control"
                          id="ward"
                          value={selectedWard}
                          onChange={(e) => setSelectedWard(e.target.value)}
                          required
                          disabled={!selectedDistrict}
                        >
                          <option value="">{t('chonXa')}</option>
                          {wards.map(ward => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="address" className="form-label">{t('diaChiDayDu')}</label>
                        <textarea 
                          className="form-control" 
                          id="address" 
                          name="address"
                          rows="3"
                          value={editAddress.address}
                          onChange={handleAddressChange}
                          required
                        ></textarea>
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