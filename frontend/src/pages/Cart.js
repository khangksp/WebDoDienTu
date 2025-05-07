import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faPlus, 
  faMinus, 
  faShoppingCart, 
  faCheckCircle, 
  faMoneyBill, 
  faCreditCard, 
  faWallet,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faCcVisa, faCcPaypal, faCcApplePay, faGooglePay, faCcStripe } from "@fortawesome/free-brands-svg-icons";
import { useCart } from "../context/CartContext";
import AOS from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'aos/dist/aos.css';
import "./style/style.css";
import { useLanguage } from "../context/LanguageContext";

function Cart() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();

  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  // State for selected payment method
  const [selectedPayment, setSelectedPayment] = useState(null);
  // State to manage checked items
  const [checkedItems, setCheckedItems] = useState({});

  // Payment methods
  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt', icon: faMoneyBill, description: 'Thanh toán khi nhận hàng (COD)' },
    { id: 'ewallet', name: 'Ví điện tử', icon: faWallet, description: 'Thanh toán qua ví của electronic store' },
    { id: 'stripe', name: 'Thẻ tín dụng (Stripe)', icon: faCcStripe, description: 'Thanh toán an toàn qua Stripe' }
  ];

  // Initialize checked state when cart items change
  useEffect(() => {
    const initialChecked = {};
    cart.items.forEach(item => {
      initialChecked[item.product_id] = true; // Default all items as checked
    });
    setCheckedItems(initialChecked);
  }, [cart.items]);

  // Function to update quantity
  const handleUpdateQuantity = async (id, increment) => {
    const item = cart.items.find(item => item.product_id === id);
    if (item) {
      const newQuantity = increment ? item.quantity + 1 : Math.max(1, item.quantity - 1);
      await updateQuantity(id, newQuantity);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (id) => {
    await removeFromCart(id);
    // Remove the item from checkedItems state
    setCheckedItems(prev => {
      const newChecked = { ...prev };
      delete newChecked[id];
      return newChecked;
    });
  };

  // Update checked state for an item
  const handleCheckboxChange = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle payment selection
  const handlePaymentSelection = (paymentId) => {
    setSelectedPayment(paymentId);
  };

  // Complete payment - Navigate to checkout with only checked items
  const completePayment = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Vui lòng đăng nhập để thanh toán');
      navigate('/login', { state: { from: '/cart' } }); // Chuyển hướng đến trang đăng nhập
      return;
    }

    if (selectedPayment) {
      const checkedCartItems = cart.items.filter(item => checkedItems[item.product_id]);
      if (checkedCartItems.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
        return;
      }
      navigate('/checkout', {
        state: {
          cartItems: checkedCartItems.map(item => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url
          })),
          paymentMethod: selectedPayment
        }
      });
      setShowModal(false);
    } else {
      alert('Vui lòng chọn phương thức thanh toán');
    }
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  // Add CSS animation for modal
  const modalAnimation = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('dangTai')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5" data-aos="fade-up">
      <style>{modalAnimation}</style>
      <h2 className="mb-4" style={{ paddingTop: '55px' }}>{t('gioHangCuaBan')}</h2>
      
      {cart.items && cart.items.length > 0 ? (
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                {cart.items.map(item => (
                  <div key={item.product_id} className="cart-item mb-4 pb-4 border-bottom" data-aos="fade-up">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <div className="form-check">
                          <input
                            className="form-check-input bg-danger border-0"
                            type="checkbox"
                            checked={checkedItems[item.product_id] || false}
                            onChange={() => handleCheckboxChange(item.product_id)}
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <img 
                          src={item.image_url || item.HinhAnh_URL}
                          alt={item.name || item.TenSanPham} 
                          className="img-fluid"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/placeholder.png';
                          }}
                        />
                      </div>
                      <div className="col-md-5">
                        <h5 className="product-title">{item.name || item.TenSanPham}</h5>
                        <p className="text-muted small mb-2">{t('gia')}: {formatPrice(item.price || item.GiaBan)}</p>
                        {item.selected_color && item.selected_color !== 'default' && (
                          <div className="d-flex mt-2">
                            <span className="me-2">{t('mauSac')}:</span>
                            <div
                              className="color-option selected"
                              style={{
                                backgroundColor: item.selected_color,
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                margin: '0 4px',
                                cursor: 'pointer',
                                border: '2px solid #000'
                              }}
                            ></div>
                          </div>
                        )}
                        <div className="mt-2">
                          <span className="me-2">{t('kichThuoc')}:</span>
                          <span className="badge bg-light text-dark">{item.size || t('tieuChuan')}</span>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="quantity-controls d-flex align-items-center">
                            <button 
                              className="btn btn-sm btn-outline-secondary" 
                              onClick={() => handleUpdateQuantity(item.product_id, false)}
                              disabled={item.quantity <= 1}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <input 
                              type="number" 
                              className="form-control form-control-sm mx-2" 
                              value={item.quantity} 
                              readOnly 
                              style={{width: '50px', textAlign: 'center'}}
                            />
                            <button 
                              className="btn btn-sm btn-outline-secondary" 
                              onClick={() => handleUpdateQuantity(item.product_id, true)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </div>
                          <button 
                            className="btn btn-sm text-danger ms-3" 
                            onClick={() => handleRemoveItem(item.product_id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                        <div className="text-end mt-2">
                          <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">{t('thongTinDonHang')}</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('tamTinh')} ({cart.items.filter(item => checkedItems[item.product_id]).length} {t('sp')}):</span>
                  <strong>{formatPrice(cart.items.reduce((sum, item) => checkedItems[item.product_id] ? sum + (item.price * item.quantity) : sum, 0))}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('phiVanChuyen')}</span>
                  <strong>{t('mienPhi')}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span>{t('tongTien')}</span>
                  <strong className="text-danger">{formatPrice(cart.items.reduce((sum, item) => checkedItems[item.product_id] ? sum + (item.price * item.quantity) : sum, 0))}</strong>
                </div>
                <button 
                  className="btn btn-danger w-100 py-2 mb-3"
                  onClick={() => setShowModal(true)}
                >
                  Thanh toán <FontAwesomeIcon icon={faCheckCircle} className="ms-2" />
                </button>
                <div className="payment-methods mt-3">
                  <p className="small mb-2">{t('cacDoiTacThanhToan')}</p>
                  <div className="d-flex flex-wrap">
                    <FontAwesomeIcon icon={faCcVisa} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                    <FontAwesomeIcon icon={faCcPaypal} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                    <FontAwesomeIcon icon={faCcApplePay} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                    <FontAwesomeIcon icon={faGooglePay} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                    <FontAwesomeIcon icon={faCcStripe} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                  </div>
                </div>
              </div>
            </div>
            <div className="card mt-3 shadow-sm">
              <div className="card-body">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Mã giảm giá" />
                  <button className="btn btn-outline-secondary">{t('apDung')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faShoppingCart} size="4x" className="text-muted mb-3" />
          <h4>{t('gioHangDangTrong')}</h4>
          <p>{t('hayThemSanPham')}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/products')} 
          >
            {t('tiepTucMuaSam')}
          </button>
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop" 
             style={{
               position: 'fixed',
               top: 0,
               left: 0,
               width: '100%',
               height: '100%',
               backgroundColor: 'rgba(255, 255, 255, 0.8)',
               backdropFilter: 'blur(5px)',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               zIndex: 1050
             }}>
          <div className="modal-content" 
               style={{
                 width: '100%',
                 maxWidth: '500px',
                 backgroundColor: 'white',
                 borderRadius: '12px',
                 boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                 zIndex: 1051,
                 animation: 'fadeIn 0.3s ease-in-out',
                 border: '1px solid #e9ecef'
               }}>
            <div className="modal-header d-flex justify-content-between align-items-center p-4 border-bottom" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px 12px 0 0' }}>
              <h5 className="modal-title fw-bold" style={{ color: '#6c757d' }}>{t('chonPhuongThuc')}</h5>
              <button 
                onClick={() => setShowModal(false)} 
                className="btn-close"
                aria-label="Close"
                style={{ transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0)'}
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="payment-options">
                {paymentMethods.map(method => (
                  <div 
                    key={method.id}
                    className={`payment-option p-3 mb-3 rounded ${selectedPayment === method.id ? 'border' : 'border'}`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedPayment === method.id ? '#dee1e3' : 'white',
                      borderColor: selectedPayment === method.id ? '#ff424e' : '',
                    }}
                    onClick={() => handlePaymentSelection(method.id)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3 payment-icon-container rounded-circle p-2" 
                           style={{
                             backgroundColor: selectedPayment === method.id ? '#f8f8ff' : '#f8f9fa', 
                             color: selectedPayment === method.id ? 'white' : '#f8f8ff', 
                             width: '50px', 
                             height: '50px',
                             display: 'flex',
                             justifyContent: 'center',
                             alignItems: 'center'
                           }}>
                        <FontAwesomeIcon icon={method.icon} size="lg" className="text-danger"/>
                      </div>
                      <div>
                        <h6 className="mb-1">{method.name}</h6>
                        <p className="text-muted mb-0 small">{method.description}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="ms-auto">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-danger" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer border-top p-3 d-flex justify-content-between">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setShowModal(false)}
              >
                {t('huy')}
              </button>
              <button 
                className="btn btn-danger" 
                onClick={completePayment}
                disabled={!selectedPayment}
              >
                {t('xacNhanThanhToan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;