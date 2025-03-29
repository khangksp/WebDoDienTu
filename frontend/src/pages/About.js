import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faQuestionCircle, faPhone } from '@fortawesome/free-solid-svg-icons';

function About() {
    return (
        <div className="container mt-5">
            {/* Khối 1: Giới thiệu */}
            <div className="p-5 mb-4 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg">
                <p className="mb-0">
                    <strong>[Tên cửa hàng]</strong> được thành lập với sứ mệnh mang đến cho khách hàng
                    những sản phẩm công nghệ chất lượng cao, chính hãng với mức giá tốt nhất.
                    Chúng tôi luôn cập nhật các xu hướng công nghệ mới nhất để đáp ứng nhu cầu của bạn.
                </p>
            </div>

            {/* Khối 2: Sản phẩm cung cấp */}
            <div className="p-5 mb-4 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg d-flex align-items-center">
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
            <div className="p-5 mb-4 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg d-flex align-items-center">
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
            <div className="p-5 w-100 mx-auto bg-light rounded border border-secondary-subtle shadow-lg d-flex align-items-center">
                <div className="flex-grow-1">
                    <p className="mb-0">
                        Sản phẩm chính hãng – Cam kết 100% sản phẩm có nguồn gốc rõ ràng.
                        <br />Giá cả cạnh tranh – Mang lại mức giá hợp lý với nhiều ưu đãi hấp dẫn.
                        <br />Bảo hành & Hỗ trợ tận tâm – Chính sách bảo hành minh bạch, hỗ trợ kỹ thuật 24/7.
                        <br />Giao hàng nhanh chóng – Ship toàn quốc, nhận hàng nhanh chỉ trong 24-48h.
                    </p>
                </div>
                <FontAwesomeIcon icon={faPhone} className="me-3 text-success" size="3x" />
            </div>
        </div>
    );
}

export default About;
