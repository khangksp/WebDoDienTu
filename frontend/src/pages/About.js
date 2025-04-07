import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faQuestionCircle, faPhone } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles

import { useLanguage } from "../context/LanguageContext";

function About() {
    const { t } = useLanguage();
    useEffect(() => {
        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true,
            offset: 200
        });
    }, []);

    const styles = {
        pageBackground: {
          backgroundColor: '#f8f9fa',
          paddingTop: '30px',
          paddingBottom: '30px'
        },
        headerSection: {
          position: 'relative',
          marginBottom: '60px',
          textAlign: 'center',
          paddingTop: '20px'

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
        }
    };

    return (
        <div className="container-fluid" style={styles.pageBackground}>
            <div className="container mt-5">
                {/* Header Section */}
                <div style={styles.headerSection}>
                    <h1 style={styles.headerTitle}>{t('gioiThieu')}
                        <div style={styles.headerUnderline}></div>
                    </h1>
                    <p className="text-muted mt-3">{t('chungToiLuon')}</p>
                </div>


                {/* Khối 1: Giới thiệu */}
                <div 
                    className="p-5 mb-4 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg"
                    data-aos="fade-up"
                >
                    <p className="mb-0">
                        <strong>[{t('tenCuaHang')}]</strong> {t('_tenCuaHang')}
                    </p>
                </div>

                {/* Khối 2: Sản phẩm cung cấp */}
                <div 
                    className="p-5 mb-4 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg d-flex align-items-center"
                    data-aos="fade-right"
                    data-aos-delay="200"
                >
                    <div className="flex-grow-1">
                        <p className="mb-0">
                        {t('chungtoi')}
                            <br />{t('sanPham1')}
                            <br />{t('sanPham2')}
                            <br />{t('sanPham3')}
                        </p>
                    </div>
                    <FontAwesomeIcon icon={faShoppingCart} className="ms-3 text-primary" size="3x" />
                </div>

                {/* Khối 3: Chính sách 1 */}
                <div 
                    className="p-5 mb-4 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg d-flex align-items-center"
                    data-aos="fade-left"
                    data-aos-delay="400"
                >
                    <FontAwesomeIcon icon={faQuestionCircle} className="me-3 text-danger" size="3x" />
                    <div className="flex-grow-1">
                        <p className="mb-0">
                        {t('sanPhamChungToi')}
                            <br />{t('chungToiLuonNoLuc')}
                            <br />{t('tapTrungVao')}
                            <br />{t('voiDichVu')}
                        </p>
                    </div>
                </div>

                {/* Khối 4: Chính sách 2 */}
                <div 
                    className="p-5 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg d-flex align-items-center"
                    data-aos="zoom-in"
                    data-aos-delay="600"
                >
                    <div className="flex-grow-1">
                        <p className="mb-0">
                        {t('sanPhamChinhHang')}
                            <br />{t('giaCanhTranh')}
                            <br />{t('baoHanh')}
                            <br />{t('giaoHangNhanhChong')}
                        </p>
                    </div>
                    <FontAwesomeIcon icon={faPhone} className="ms-3 text-success" size="3x" />
                </div>
            </div>
        </div>
    );
}

export default About;