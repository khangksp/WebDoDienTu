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
import { faCcStripe } from '@fortawesome/free-brands-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/checkout.css';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { API_BASE_URL } from '../config';
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";

// Initialize Stripe with Publishable Key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Parse JWT token
function parseJwt(token) {
  if (!token || typeof token !== 'string') {
    console.error("Invalid or missing JWT token");
    return {};
  }
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error("JWT token has no payload");
      return {};
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return {};
  }
}

function Checkout() {
  const { t } = useLanguage();
  const { cart, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check for payment failure
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('payment_failed') === 'true') {
      const orderId = query.get('order_id');
      alert(`Thanh toán thất bại cho đơn hàng #${orderId}. Vui lòng thử lại.`);
    }
  }, [location.search]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      localStorage.setItem("redirect_after_login", window.location.pathname);
      alert('Please log in to continue checkout');
      navigate('/login');
    }
  }, [navigate]);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const nguoiDungData = userData.nguoidung_data || {};

  // Initialize cart items from location.state or cart
  const [cartItems, setCartItems] = useState([]);
  useEffect(() => {
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
    } else if (cart?.items?.length > 0) {
      setCartItems(cart.items);
    }
  }, [cart, location.state]);

  const [paymentMethod, setPaymentMethod] = useState(location.state?.paymentMethod || 'cash');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Initialize address from user data
  const [selectedAddress, setSelectedAddress] = useState({
    id: 1,
    isDefault: true,
    recipient: nguoiDungData.tennguoidung || '',
    phone: nguoiDungData.sodienthoai || '',
    address: nguoiDungData.diachi || ''
  });

  // State for address form
  const [editAddress, setEditAddress] = useState({
    recipient: nguoiDungData.tennguoidung || '',
    phone: nguoiDungData.sodienthoai || '',
    address: nguoiDungData.diachi || ''
  });

  // State for province/district/ward dropdowns
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province is selected
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
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince]);

  // Fetch wards when district is selected
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
          const data = await response.json();
          setWards(data.wards || []);
          setSelectedWard('');
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      };
      fetchWards();
    }
  }, [selectedDistrict]);

  // Auto-fill address when ward is selected
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
  const shippingFee = 0;
  const grandTotal = totalPrice + shippingFee;

  // Get payment method details
  const getPaymentMethodName = (method) => {
    const methods = {
      'cash': { name: 'Cash', icon: faMoneyBill },
      'ewallet': { name: 'E-Wallet', icon: faWallet },
      'stripe': { name: 'Credit Card (Stripe)', icon: faCcStripe }
    };
    return methods[method] || { name: 'Unknown', icon: faMoneyBill };
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

  // Update address
  const updateAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token || !userData?.mataikhoan) {
      alert(t("pleaseLogin"));
      navigate('/login');
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/users/update/${userData.mataikhoan}/`,
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
        const updatedUser = response.data.user;
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

        setSelectedAddress({
          id: 1,
          isDefault: true,
          recipient: updatedUser.nguoidung_data?.tennguoidung || editAddress.recipient,
          phone: updatedUser.nguoidung_data?.sodienthoai || editAddress.phone,
          address: updatedUser.nguoidung_data?.diachi || editAddress.address,
        });

        setShowAddressModal(false);
        alert(t("updateSuccess"));
      }
    } catch (error) {
      console.error('Error updating address:', error);
      const errorMsg = error.response?.data?.message || t("updateFailed");
      alert(errorMsg);
    }
  };

  // Place order
  const placeOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      alert('Cart is empty, cannot place order');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert('Please log in to place order');
        localStorage.setItem("redirect_after_login", window.location.pathname);
        navigate('/login');
        setIsLoading(false);
        return;
      }

      let userId = userData.mataikhoan;
      if (!userId) {
        const tokenPayload = parseJwt(token);
        userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.sub;
      }

      if (!userId) {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/api/auth/users/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.id || userData.user_id;
            localStorage.setItem("user_id", userId);
            localStorage.setItem("user_data", JSON.stringify(userData));
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      if (!userId) {
        userId = 1;
        console.warn("User ID not found, using default:", userId);
      }

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
        })),
        status: paymentMethod === 'stripe' ? 'Chờ thanh toán' : 'Chờ xác nhận'
      };

      // Create order in order_service
      const orderResponse = await fetch(`${API_BASE_URL}/orders/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const orderResponseText = await orderResponse.text();
      if (!orderResponse.ok) {
        if (orderResponse.status === 401) {
          alert('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        try {
          const errorData = JSON.parse(orderResponseText);
          throw new Error(errorData.message || `HTTP Error: ${orderResponse.status}`);
        } catch (e) {
          throw new Error(`HTTP Error: ${orderResponse.status}`);
        }
      }

      const orderResult = JSON.parse(orderResponseText);
      const orderId = orderResult.order_id;

      if (paymentMethod === 'stripe') {
        const stripeResponse = await fetch(`${API_BASE_URL}/payments/create-checkout-session/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: orderId,
            amount: grandTotal,
            currency: 'vnd',
            items: orderData.items,
            user_id: orderData.user_id,
            recipient_name: orderData.recipient_name,
            phone_number: orderData.phone_number,
            address: orderData.address,
            metadata: { order_id: orderId.toString() }
          })
        });

        const stripeResult = await stripeResponse.json();
        if (!stripeResponse.ok) {
          // Update order status to failed if Stripe session creation fails
          await fetch(`${API_BASE_URL}/orders/update/${orderId}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'Thất bại' })
          });
          throw new Error(stripeResult.error || 'Error creating Stripe checkout session');
        }

        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({ sessionId: stripeResult.session_id });
        if (error) {
          // Update order status to failed if redirect fails
          await fetch(`${API_BASE_URL}/orders/update/${orderId}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'Thất bại' })
          });
          throw new Error(error.message);
        }
      } else {
        await clearCart(cartItems);
        alert('Order placed successfully! Thank you for shopping.');
        navigate('/order-confirmation', { 
          state: { 
            orderId: orderResult.order_id,
            totalAmount: orderResult.total_amount
          } 
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`An error occurred while placing the order: ${error.message}`);
    } finally {
      setIsLoading(false);
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
              <span>{t('backToCart')}</span>
            </button>
            <h2 className="checkout-title mt-3" style={{ margin: '0', padding: '0' }}>{t('checkout')}</h2>
          </div>

          <div className="col-lg-8">
            {/* Shipping Address Section */}
            <div className="checkout-card mb-4">
              <div className="checkout-card-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="header-icon" />
                <h5>{t('shippingAddress')}</h5>
                <button 
                  className="btn btn-sm ms-auto custom-hover"
                  onClick={() => setShowAddressModal(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-1" /> {t('change')}
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
                        <span className="default-badge ms-2">{t('default')}</span>
                      )}
                    </div>
                    <div className="address-text mt-2">
                      {selectedAddress.address}
                    </div>
                  </div>
                ) : (
                  <div className="no-address">
                    <p>{t('noAddress')}</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddressModal(true)}
                    >
                      {t('addAddress')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="checkout-card mb-4">
              <div className="checkout-card-header">
                <FontAwesomeIcon icon={getPaymentMethodName(paymentMethod).icon} className="header-icon" />
                <h5>{t('paymentMethod')}</h5>
              </div>
              <div className="checkout-card-body">
                <div className="payment-method-info">
                  <div className="method-icon-container">
                    <FontAwesomeIcon icon={getPaymentMethodName(paymentMethod).icon} />
                  </div>
                  <div className="method-details">
                    <p className="mb-0">{getPaymentMethodName(paymentMethod).name}</p>
                    <small className="text-muted">
                      {paymentMethod === 'cash' && 'Pay on delivery (COD)'}
                      {paymentMethod === 'ewallet' && 'Pay via electronic store wallet'}
                      {paymentMethod === 'stripe' && 'Secure payment via Stripe'}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="checkout-card mb-4">
              <div className="checkout-card-header">
                <FontAwesomeIcon icon={faShoppingBag} className="header-icon" />
                <h5>{t('yourOrder')} ({cartItems.length} {t('items')})</h5>
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
                <h5>{t('shippingInfo')}</h5>
              </div>
              <div className="checkout-card-body">
                <div className="shipping-info">
                  <p className="mb-1">{t('shippingMethod')}</p>
                  <p className="mb-1">{t('shippingTime')}</p>
                  <p className="mb-0">{t('shippingFee')} {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Order Summary Card */}
            <div className="checkout-card summary-card">
              <div className="checkout-card-header">
                <h5>{t('total')}</h5>
              </div>
              <div className="checkout-card-body">
                <div className="summary-item d-flex justify-content-between">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="summary-item d-flex justify-content-between">
                  <span>{t('shippingFee')}</span>
                  <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
                </div>
                <hr />
                <div className="summary-total d-flex justify-content-between">
                  <span className="fw-bold">{t('grandTotal')}</span>
                  <span className="fw-bold text-danger">{formatPrice(grandTotal)}</span>
                </div>
                <button 
                  className="btn btn-danger btn-place-order w-100 mt-4"
                  onClick={placeOrder}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    t('placeOrder')
                  )}
                </button>
                <div className="order-note mt-3">
                  <p className="mb-0 text-muted small">{t('orderNote')}</p>
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
                <h5>{t('shippingAddress')}</h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowAddressModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="address-list">
                  <h6 className="mb-3">{t('currentAddress')}</h6>
                  {selectedAddress ? (
                    <div className="address-option selected">
                      <div className="recipient">
                        <span className="fw-bold">{selectedAddress.recipient}</span>
                        <span className="text-divider">|</span>
                        <span>{selectedAddress.phone}</span>
                        {selectedAddress.isDefault && (
                          <span className="default-badge ms-2">{t('default')}</span>
                        )}
                      </div>
                      <div className="address-text mt-2">
                        {selectedAddress.address}
                      </div>
                    </div>
                  ) : (
                    <p>{t('noSavedAddress')}</p>
                  )}
                </div>
                <hr />
                <div className="edit-address-form">
                  <h6 className="mb-3">{t('editAddress')}</h6>
                  <form onSubmit={updateAddress}>
                    <div className="mb-3">
                      <label htmlFor="recipient" className="form-label">{t('recipientName')}</label>
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
                      <label htmlFor="phone" className="form-label">{t('phoneNumber')}</label>
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
                      <label htmlFor="province" className="form-label">{t('province')}</label>
                      <select
                        className="form-control"
                        id="province"
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        required
                      >
                        <option value="">{t('selectProvince')}</option>
                        {provinces.map(province => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="district" className="form-label">{t('district')}</label>
                      <select
                        className="form-control"
                        id="district"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        required
                        disabled={!selectedProvince}
                      >
                        <option value="">{t('selectDistrict')}</option>
                        {districts.map(district => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="ward" className="form-label">{t('ward')}</label>
                      <select
                        className="form-control"
                        id="ward"
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        required
                        disabled={!selectedDistrict}
                      >
                        <option value="">{t('selectWard')}</option>
                        {wards.map(ward => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">{t('fullAddress')}</label>
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
                        {t('cancel')}
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                      >
                        {t('saveAddress')}
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