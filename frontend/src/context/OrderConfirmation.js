import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faHome, 
  faListUl,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { useLanguage } from "./LanguageContext";

function OrderConfirmation() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order details from location state
  const { orderId, totalAmount } = location.state || {};
  
  useEffect(() => {
    // Initialize AOS animation
    AOS.init({
      duration: 800,
      once: true,
    });
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);
  
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };
  
  // Navigate to home page
  const goToHome = () => {
    navigate('/');
  };
  
  // Navigate to order history
  const viewOrders = () => {
    navigate('/my-orders');
  };
  
  return (
    <div className="container my-5 py-5" data-aos="fade-up">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div className="card-body p-md-5 text-center">
              <div className="confirmation-icon mb-4">
                <div className="success-checkmark">
                  <div className="check-icon">
                    <FontAwesomeIcon 
                      icon={faCheckCircle} 
                      className="text-success" 
                      style={{ fontSize: '5rem' }} 
                    />
                  </div>
                </div>
              </div>
              
              <h2 className="fw-bold mb-4">{t('datHangThanhCong')}</h2>
              
              <p className="mb-4">
                {t('camOnBanDaDatHang')}
              </p>
              
              {orderId && (
                <div className="order-details p-4 mb-4 bg-light rounded">
                  <div className="row mb-3">
                    <div className="col-sm-6 text-sm-end fw-bold">{t('maDonHang')}:</div>
                    <div className="col-sm-6 text-sm-start">{orderId}</div>
                  </div>
                  
                  {totalAmount && (
                    <div className="row">
                      <div className="col-sm-6 text-sm-end fw-bold">{t('tongTien')}:</div>
                      <div className="col-sm-6 text-sm-start text-danger">{formatPrice(totalAmount)}</div>
                    </div>
                  )}
                </div>
              )}
              
              <p className="mb-4">
                {t('thongTinDonHangSeDuocGui')} 
                <br />
                {t('neuCoThacMac')}
              </p>
              
              <div className="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
                <button 
                  className="btn btn-outline-primary px-4 py-2"
                  onClick={goToHome}
                >
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  {t('trangChu')}
                </button>
                
                <button 
                  className="btn btn-primary px-4 py-2"
                  onClick={viewOrders}
                >
                  <FontAwesomeIcon icon={faListUl} className="me-2" />
                  {t('xemDonHang')}
                </button>
              </div>
              
              <div className="mt-5 border-top pt-4">
                <h5 className="mb-3">{t('cacBuocTiepTheo')}</h5>
                
                <div className="row justify-content-center">
                  <div className="col-md-10">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                      <div className="next-step mb-3 mb-md-0">
                        <div className="step-number">1</div>
                        <div className="step-text">{t('xacNhanDonHang')}</div>
                      </div>
                      
                      <FontAwesomeIcon icon={faArrowRight} className="d-none d-md-block text-muted" />
                      
                      <div className="next-step mb-3 mb-md-0">
                        <div className="step-number">2</div>
                        <div className="step-text">{t('chuanBiDonHang')}</div>
                      </div>
                      
                      <FontAwesomeIcon icon={faArrowRight} className="d-none d-md-block text-muted" />
                      
                      <div className="next-step">
                        <div className="step-number">3</div>
                        <div className="step-text">{t('giaoHang')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .step-number {
          width: 40px;
          height: 40px;
          background-color: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin: 0 auto 10px;
        }
        
        .next-step {
          text-align: center;
          padding: 15px;
          width: 150px;
        }
        
        @media (max-width: 768px) {
          .next-step {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default OrderConfirmation;