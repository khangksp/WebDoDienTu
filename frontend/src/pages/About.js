import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faQuestionCircle, faPhone } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles

function About() {
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
        }
    };

    return (
        <div className="container-fluid" style={styles.pageBackground}>
            <div className="container mt-5">
                {/* Header Section */}
                <div style={styles.headerSection}>
                    <h1 style={styles.headerTitle}>Giới thiệu
                        <div style={styles.headerUnderline}></div>
                    </h1>
                    <p className="text-muted mt-3">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
                </div>


                {/* Khối 1: Giới thiệu */}
                <div 
                    className="p-5 mb-4 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg"
                    data-aos="fade-up"
                >
                    <p className="mb-0">
                        <strong>[Tên cửa hàng]</strong> được thành lập với sứ mệnh mang đến cho khách hàng
                        những sản phẩm công nghệ chất lượng cao, chính hãng với mức giá tốt nhất.
                        Chúng tôi luôn cập nhật các xu hướng công nghệ mới nhất để đáp ứng nhu cầu của bạn.
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
                            Chúng tôi cung cấp đa dạng các sản phẩm:
                            <br />Laptop, PC, Gaming Gear – Hiệu suất cao, phục vụ học tập, làm việc và giải trí.
                            <br />Điện thoại, Tablet, Phụ kiện – Chính hãng, đa dạng mẫu mã.
                            <br />Thiết bị thông minh – Loa Bluetooth, Smartwatch, Camera giám sát...
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
                            Sản phẩm chính hãng – Cam kết 100% sản phẩm có nguồn gốc rõ ràng.
                            <br />Giá cả cạnh tranh – Mang lại mức giá hợp lý với nhiều ưu đãi hấp dẫn.
                            <br />Bảo hành & Hỗ trợ tận tâm – Chính sách bảo hành minh bạch, hỗ trợ kỹ thuật 24/7.
                            <br />Giao hàng nhanh chóng – Ship toàn quốc, nhận hàng nhanh chỉ trong 24-48h.
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
                            Sản phẩm chính hãng – Cam kết 100% sản phẩm có nguồn gốc rõ ràng.
                            <br />Giá cả cạnh tranh – Mang lại mức giá hợp lý với nhiều ưu đãi hấp dẫn.
                            <br />Bảo hành & Hỗ trợ tận tâm – Chính sách bảo hành minh bạch, hỗ trợ kỹ thuật 24/7.
                            <br />Giao hàng nhanh chóng – Ship toàn quốc, nhận hàng nhanh chỉ trong 24-48h.
                        </p>
                    </div>
                    <FontAwesomeIcon icon={faPhone} className="ms-3 text-success" size="3x" />
                </div>
            </div>
        </div>
    );
}

export default About;