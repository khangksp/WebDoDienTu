import React from "react";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { faCcVisa, faCcPaypal, faCcApplePay, faGooglePay } from "@fortawesome/free-brands-svg-icons";


function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                {/* Cột bên trái */}
                <div className="footer-left">
                    <h2>Web Bán Đồ Điện Tử</h2>
                    <p>Cung cấp sản phẩm công nghệ chất lượng, chính hãng, giá tốt nhất thị trường.</p>
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
                    <h4>Company</h4>
                    <ul>
                        <li><a href="#">About</a></li>
                        <li><a href="#">Features</a></li>
                        <li><a href="#">Works</a></li>
                        <li><a href="#">Career</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Help</h4>
                    <ul>
                        <li><a href="#">Customer Support</a></li>
                        <li><a href="#">Delivery Details</a></li>
                        <li><a href="#">Terms & Conditions</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>FAQ</h4>
                    <ul>
                        <li><a href="#">Account</a></li>
                        <li><a href="#">Manage Deliveries</a></li>
                        <li><a href="#">Orders</a></li>
                        <li><a href="#">Payments</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="#">Free eBooks</a></li>
                        <li><a href="#">Development Tutorial</a></li>
                        <li><a href="#">How to - Blog</a></li>
                        <li><a href="#">Youtube Playlist</a></li>
                    </ul>
                </div>
                {/* Dòng bản quyền */}
                <hr className="footer-divider" />
                <div className="footer-bottom">
                    <p>&copy; 2025 Web Bán Đồ Điện Tử. All Rights Reserved.</p>
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
