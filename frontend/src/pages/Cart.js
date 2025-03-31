import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faShoppingCart, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCcVisa, faCcPaypal, faCcApplePay, faGooglePay } from "@fortawesome/free-brands-svg-icons";

import AOS from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'aos/dist/aos.css';
import "./style/style.css";

function Cart() {
  // Initialize AOS animation library
  React.useEffect(() => {
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

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  return (
    <div className="container my-5" data-aos="fade-up">
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
                
                <button className="btn btn-primary w-100 py-2 mb-3">
                  Thanh toán <FontAwesomeIcon icon={faCheckCircle} className="ms-2" />
                </button>
                
                <div className="payment-methods mt-3">
                    <p className="small mb-2">Phương thức thanh toán</p>
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
    </div>
  );
}

export default Cart;