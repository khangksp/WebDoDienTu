import React from "react";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faCcVisa, faCcPaypal, faCcApplePay, faGooglePay } from "@fortawesome/free-brands-svg-icons";

import { useLanguage } from "../context/LanguageContext"; // Import useLanguage hook


function Footer() {
    const { t } = useLanguage(); // Sử dụng hook useLanguage
    return (
        <footer className="footer">
            <div className="container">
                {/* Cột bên trái */}
                <div className="footer-left">
                    <h2>{t('webBanDoDienTu')}</h2>
                    <p>{t('cungCap')}</p>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faFacebook} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faTwitter} />
                        </a>
                    </div>
                </div>

                {/* Cột thông tin */}
                <div className="footer-column">
                    <h4>{t('congTy')}</h4>
                    <ul>
                        <li><a href="#">{t('gioiThieu')}</a></li>
                        <li><a href="#">{t('dacTrung')}</a></li>
                        <li><a href="#">{t('baiViet')}</a></li>
                        <li><a href="#">{t('suNghiep')}</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>{t('chinhSach')}</h4>
                    <ul>
                        <li><a href="#">{t('hoTroKhachHang')}</a></li>
                        <li><a href="#">{t('chiTietGiaoHang')}</a></li>
                        <li><a href="#">{t('dieuKhoanDieuKien')}</a></li>
                        <li><a href="#">{t('chinhSachBM')}</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>{t('cauHoi')}</h4>
                    <ul>
                        <li><a href="#">{t('taiKhoan')}</a></li>
                        <li><a href="#">{t('quanLyGiaoHang')}</a></li>
                        <li><a href="#">{t('datHang')}</a></li>
                        <li><a href="#">{t('thanhToan')}</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>{t('taiNguyen')}</h4>
                    <ul>
                        <li><a href="#">{t('sachDienTu')}</a></li>
                        <li><a href="#">{t('huongDanPhatTrien')}</a></li>
                        <li><a href="#">{t('cachThucHien')}</a></li>
                        <li><a href="#">{t('Youtube')}</a></li>
                    </ul>
                </div>
                {/* Dòng bản quyền */}
                <hr className="footer-divider" />
                <div className="footer-bottom">
                    <p>&copy; {t('banQuyen')}</p>
                    <div className="payment-icons">
                        <FontAwesomeIcon icon={faCcVisa} size="2x" />
                        <FontAwesomeIcon icon={faCcPaypal} size="2x" />
                        <FontAwesomeIcon icon={faCcApplePay} size="2x" />
                        <FontAwesomeIcon icon={faGooglePay} size="2x" />
                    </div>
                </div>

            </div>
        </footer>
    );
}

export default Footer;
