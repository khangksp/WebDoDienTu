import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset, faEnvelope, faBuilding, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import { useLanguage } from "../context/LanguageContext";


function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    phone: '',
    email: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    alert('Cảm ơn bạn đã gửi thông tin liên hệ!');
    setFormData({
      name: '',
      content: '',
      phone: '',
      email: ''
    });
  };

  // Custom CSS for enhanced styling
  const styles = {
    pageBackground: {
      backgroundColor: '#f8f9fa',
      paddingTop: '30px',
      paddingBottom: '30px'
    },
    headerSection: {
      position: 'relative',
      paddingTop: '43px',
      marginBottom: '60px',
      textAlign: 'center'
    },
    headerTitle: {
      fontWeight: '700',
      color: '#2c3e50',
      position: 'relative',
      display: 'inline-block',
      paddingBottom: '15px'
    },
    headerUnderline: {
      content: '',
      position: 'absolute',
      left: '50%',
      bottom: '0',
      width: '180px',
      height: '3px',
      backgroundColor: '#000000',
      transform: 'translateX(-50%)'
    },
    cardHover: {
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer'
    },
    iconCircle: {
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      marginRight: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
    },
    formCard: {
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      border: 'none'
    },
    formHeader: {
      backgroundColor: '#000000',
      color: '#fff',
      padding: '20px',
      textAlign: 'center',
      borderTopLeftRadius: '10px',
      borderTopRightRadius: '10px'
    },
    submitButton: {
      backgroundColor: '#000000',
      borderColor: '#000000',
      borderRadius: '30px',
      color: '#fff',
      padding: '10px',
      fontWeight: 'bold',
      boxShadow: '0 5px 15px rgba(52, 152, 219, 0.3)',
      transition: 'all 0.3s'
    },
    infoCard: {
      padding: '30px 20px',
      borderRadius: '10px',
      backgroundColor: '#fff',
      boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
      transition: 'transform 0.3s',
      height: '100%',
      border: 'none'
    },
    mapCard: {
      background: 'linear-gradient(135deg,rgb(170, 167, 167),rgb(0, 0, 0))',
      color: 'white'
    }
  };

  return (
    <div className="container-fluid" style={styles.pageBackground}>
      <div className="container mt-4">
        {/* Header Section */}
        <div style={styles.headerSection}>
          <h1 style={styles.headerTitle}>{t('lienHe')}
            <div style={styles.headerUnderline}></div>
          </h1>
          
          <p className="text-muted mt-3">{t('langNgheHoTro')}</p>
        </div>
        
        {/* Branch Information Cards */}
        <div className="row mb-5">
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow border-0" 
                style={styles.cardHover}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                }}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div style={{...styles.iconCircle, backgroundColor: '#e8f4fc'}}>
                    <i className="fas fa-home fa-2x text-primary"></i>
                  </div>
                  <h3 className="card-title mb-0 fw-bold">{t('chiNhanh1')}</h3>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div style={{...styles.iconCircle, backgroundColor: '#e6f7ef'}}>
                    <i className="fas fa-map-marker-alt fa-lg text-success"></i>
                  </div>
                  <p className="card-text mb-0">{t('dcChiNhanh1')}</p>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{...styles.iconCircle, backgroundColor: '#fdeeee'}}>
                    <i className="fas fa-phone-alt fa-lg text-danger"></i>
                  </div>
                  <p className="card-text mb-0">0978654123</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow border-0" 
                style={styles.cardHover}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                }}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-4">
                  <div style={{...styles.iconCircle, backgroundColor: '#e8f4fc'}}>
                    <i className="fas fa-home fa-2x text-primary"></i>
                  </div>
                  <h3 className="card-title mb-0 fw-bold">{t('chiNhanh2')}</h3>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div style={{...styles.iconCircle, backgroundColor: '#e6f7ef'}}>
                    <i className="fas fa-map-marker-alt fa-lg text-success"></i>
                  </div>
                  <p className="card-text mb-0">{t('dcChiNhanh2')}</p>
                </div>
                <div className="d-flex align-items-center">
                  <div style={{...styles.iconCircle, backgroundColor: '#fdeeee'}}>
                    <i className="fas fa-phone-alt fa-lg text-danger"></i>
                  </div>
                  <p className="card-text mb-0">0978654124</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow border-0"
                style={{...styles.cardHover, ...styles.mapCard}}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                }}>
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <div className="text-center">
                    <i className="fas fa-map-marked-alt fa-4x mb-3"></i>
                    <h4 className="fw-bold">{t('banDo')}</h4>
                    <p className="mb-0 mt-2">{t('xemBanDo')}</p>
                </div>
                <div className="mt-3 w-100">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d271985.66834347177!2d106.51781072812501!3d10.875364892728241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d1be2495c19d%3A0xafd977d94466ffc2!2zxJDhuqFpIGjhu41jIELDrG5oIETGsMahbmc!5e0!3m2!1svi!2s!4v1743266034308!5m2!1svi!2s" 
                  width="100%" 
                  height="250" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                </div>
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="card mb-5" style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 className="mb-0 fw-bold">{t('guiLienHe')}</h2>
            <p className="mb-0 mt-2">{t('hayDienThongTin')}</p>
          </div>
          
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label fw-bold">{t('tenBan')}</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="fas fa-user text-primary"></i></span>
                  <input
                    type="text"
                    className="form-control py-2"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tên của bạn"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="form-label fw-bold">{t('noiDung')}</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="fas fa-comment text-primary"></i></span>
                  <textarea
                    className="form-control py-2"
                    id="content"
                    name="content"
                    rows="4"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Nội dung"
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label htmlFor="phone" className="form-label fw-bold">{t('sdt')}</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="fas fa-phone text-primary"></i></span>
                    <input
                      type="tel"
                      className="form-control py-2"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Số điện thoại của bạn"
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label fw-bold">{t('email')}</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="fas fa-envelope text-primary"></i></span>
                    <input
                      type="email"
                      className="form-control py-2"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email của bạn"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4 d-flex justify-content-center">
                <button
                  type="submit"
                  className="btn btn-primary px-5 py-3 d-flex align-items-center justify-content-center"
                  style={styles.submitButton}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 15px rgba(40, 42, 44, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 5px 15px rgba(49, 49, 49, 0.3)";
                  }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" /> {t('gui')}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="row text-center mb-5">
          <div className="col-md-4 mb-4">
            <div className="card" style={styles.infoCard} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="card-body">
                <div className="mb-4">
                  <div className="bg-warning text-white rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <FontAwesomeIcon icon={faHeadset} size="2x" />
                  </div>
                </div>
                <h3 className="h4 mb-3 fw-bold">{t('hoTro247')}</h3>
                <p className="text-muted mb-0">{t('chungToiLuonSanSang')}</p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card" style={styles.infoCard} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="card-body">
                <div className="mb-4">
                  <div className="bg-info text-white rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <FontAwesomeIcon icon={faEnvelope} size="2x" />
                  </div>
                </div>
                <h3 className="h4 mb-3 fw-bold">Email</h3>
                <p className="text-muted mb-0">info@example.com</p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card" style={styles.infoCard} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="card-body">
                <div className="mb-4">
                  <div className="bg-success text-white rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <FontAwesomeIcon icon={faBuilding} size="2x" />
                  </div>
                </div>
                <h3 className="h4 mb-3 fw-bold">{t('truSoChinh')}</h3>
                <p className="text-muted mb-0">{t('_truSoChinh')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;