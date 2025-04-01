import React, { useState, useEffect } from 'react';
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
import { faCcVisa, faCcPaypal, faCcApplePay, faGooglePay } from "@fortawesome/free-brands-svg-icons";

import AOS from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'aos/dist/aos.css';
import "./style/style.css";

function Cart() {
  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // State for cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Croma Bluetooth Wireless Over Ear Headphones With Mic Playback',
      price: 100000,
      quantity: 1,
      image: '/assets/headphone.png',
      colors: ['gray', 'white', 'lightblue'],
      selectedColor: 'gray'
    },
    {
      id: 2,
      name: 'Croma Bluetooth Wireless Over Ear Headphones With Mic Playback',
      price: 100000,
      quantity: 1,
      image: '/assets/loa.jpg',
      colors: ['gray', 'white', 'lightblue'],
      selectedColor: 'lightblue'
    },
    {
      id: 3,
      name: 'Croma Bluetooth Wireless Over Ear Headphones With Mic Playback',
      price: 100000,
      quantity: 1,
      image: '/assets/taycam.jpg',
      colors: ['gray', 'white', 'lightblue'],
      selectedColor: 'lightblue'
    }
  ]);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  // State for selected payment method
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Payment methods
  const paymentMethods = [
    { id: 'cash', name: 'Tiền mặt', icon: faMoneyBill, description: 'Thanh toán khi nhận hàng (COD)' },
    { id: 'bank', name: 'Chuyển khoản', icon: faCreditCard, description: 'Chuyển khoản qua ngân hàng' },
    { id: 'ewallet', name: 'Ví điện tử', icon: faWallet, description: 'Thanh toán qua ví MoMo, ZaloPay, VNPay' }
  ];

  // Function to update quantity
  const updateQuantity = (id, increment) => {
    setCartItems(
      cartItems.map(item => {
        if (item.id === id) {
          const newQuantity = increment ? item.quantity + 1 : Math.max(1, item.quantity - 1);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Function to remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Function to update selected color
  const updateColor = (id, color) => {
    setCartItems(
      cartItems.map(item => {
        if (item.id === id) {
          return { ...item, selectedColor: color };
        }
        return item;
      })
    );
  };

  // Handle payment selection
  const handlePaymentSelection = (paymentId) => {
    setSelectedPayment(paymentId);
  };

  // Complete payment
  const completePayment = () => {
    if (selectedPayment) {
      // Here you would normally process the payment
      alert(`Đã chọn phương thức thanh toán: ${paymentMethods.find(p => p.id === selectedPayment).name}`);
      setShowModal(false);
    } else {
      alert('Vui lòng chọn phương thức thanh toán');
    }
  };

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  return (
    <div className="container my-5" data-aos="fade-up">
      <style>{modalAnimation}</style>
      <h2 className="mb-4">Giỏ hàng của bạn</h2>
      
      {cartItems.length > 0 ? (
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item mb-4 pb-4 border-bottom" data-aos="fade-up">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" checked={true} onChange={() => {}} />
                        </div>
                      </div>
                      
                      <div className="col-md-2">
                        <img src={item.image} alt={item.name} className="img-fluid" />
                      </div>
                      
                      <div className="col-md-5">
                        <h5 className="product-title">{item.name}</h5>
                        <p className="text-muted small mb-2">Giá: {formatPrice(item.price)}</p>
                        
                        <div className="d-flex mt-2">
                          <span className="me-2">Màu sắc:</span>
                          {item.colors.map(color => (
                            <div
                              key={color}
                              className={`color-option ${item.selectedColor === color ? 'selected' : ''}`}
                              style={{
                                backgroundColor: color,
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                margin: '0 4px',
                                cursor: 'pointer',
                                border: item.selectedColor === color ? '2px solid #000' : '1px solid #ddd'
                              }}
                              onClick={() => updateColor(item.id, color)}
                            ></div>
                          ))}
                        </div>
                        
                        <div className="mt-2">
                          <span className="me-2">Kích thước:</span>
                          <span className="badge bg-light text-dark">Tiêu chuẩn</span>
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="quantity-controls d-flex align-items-center">
                            <button 
                              className="btn btn-sm btn-outline-secondary" 
                              onClick={() => updateQuantity(item.id, false)}
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
                              onClick={() => updateQuantity(item.id, true)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </div>
                          
                          <button 
                            className="btn btn-sm text-danger ms-3" 
                            onClick={() => removeItem(item.id)}
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
                <h5 className="mb-0">Thông tin đơn hàng</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                  <strong>{formatPrice(totalPrice)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <strong>Miễn phí</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span>Tổng tiền:</span>
                  <strong className="text-danger">{formatPrice(totalPrice)}</strong>
                </div>
                
                <button 
                  className="btn btn-primary w-100 py-2 mb-3"
                  onClick={() => setShowModal(true)}
                >
                  Thanh toán <FontAwesomeIcon icon={faCheckCircle} className="ms-2" />
                </button>
                
                <div className="payment-methods mt-3">
                  <p className="small mb-2">Các đối tác thanh toán</p>
                  <div className="d-flex flex-wrap">
                    <FontAwesomeIcon icon={faCcVisa} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                    <FontAwesomeIcon icon={faCcPaypal} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                    <FontAwesomeIcon icon={faCcApplePay} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                    <FontAwesomeIcon icon={faGooglePay} className="payment-icon me-2 mb-2" style={{width: '40px'}} size="2x" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mt-3 shadow-sm">
              <div className="card-body">
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Mã giảm giá" />
                  <button className="btn btn-outline-secondary">Áp dụng</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faShoppingCart} size="4x" className="text-muted mb-3" />
          <h4>Giỏ hàng của bạn đang trống</h4>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <button className="btn btn-primary">Tiếp tục mua sắm</button>
        </div>
      )}

      {/* Modal Phương thức thanh toán */}
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
              <h5 className="modal-title fw-bold" style={{ color: '#0d6efd' }}>Chọn phương thức thanh toán</h5>
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
                    className={`payment-option p-3 mb-3 rounded ${selectedPayment === method.id ? 'border border-primary' : 'border'}`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedPayment === method.id ? '#f0f7ff' : 'white'
                    }}
                    onClick={() => handlePaymentSelection(method.id)}
                  >
                    <div className="d-flex align-items-center">
                      <div className="me-3 payment-icon-container rounded-circle p-2" 
                           style={{
                             backgroundColor: selectedPayment === method.id ? '#0d6efd' : '#f8f9fa', 
                             color: selectedPayment === method.id ? 'white' : '#0d6efd', 
                             width: '50px', 
                             height: '50px',
                             display: 'flex',
                             justifyContent: 'center',
                             alignItems: 'center'
                           }}>
                        <FontAwesomeIcon icon={method.icon} size="lg" />
                      </div>
                      <div>
                        <h6 className="mb-1">{method.name}</h6>
                        <p className="text-muted mb-0 small">{method.description}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="ms-auto">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-primary" />
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
                Hủy
              </button>
              <button 
                className="btn btn-primary" 
                onClick={completePayment}
                disabled={!selectedPayment}
              >
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;