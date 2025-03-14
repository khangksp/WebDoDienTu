import React from 'react';

function About() {
    return (
        <div className="about-container container mt-4">
            <h1>Giới thiệu về Web Bán Đồ Điện Tử</h1>
            <p className="lead">
                Chào mừng bạn đến với trang web bán đồ điện tử của chúng tôi! Chúng tôi tự hào là một trong những nhà cung cấp hàng đầu về các sản phẩm điện tử chất lượng cao và dịch vụ khách hàng tuyệt vời.
            </p>
            <div className="row">
                <div className="col-md-6">
                    <h2>Sứ mệnh của chúng tôi</h2>
                    <p>
                        Sứ mệnh của chúng tôi là cung cấp cho khách hàng những sản phẩm điện tử tốt nhất với giá cả hợp lý. Chúng tôi cam kết mang đến cho bạn trải nghiệm mua sắm trực tuyến tuyệt vời và dịch vụ hậu mãi chu đáo.
                    </p>
                </div>
                <div className="col-md-6">
                    <h2>Tầm nhìn của chúng tôi</h2>
                    <p>
                        Tầm nhìn của chúng tôi là trở thành nhà bán lẻ điện tử hàng đầu tại Việt Nam, nơi khách hàng có thể tìm thấy mọi thứ họ cần với chất lượng và giá trị tốt nhất.
                    </p>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-md-4">
                    <h3>Chất lượng sản phẩm</h3>
                    <p>
                        Chúng tôi chỉ cung cấp những sản phẩm từ các thương hiệu uy tín và được kiểm tra chất lượng kỹ lưỡng trước khi đến tay khách hàng.
                    </p>
                </div>
                <div className="col-md-4">
                    <h3>Dịch vụ khách hàng</h3>
                    <p>
                        Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Chúng tôi luôn lắng nghe và giải quyết mọi thắc mắc của bạn một cách nhanh chóng và hiệu quả.
                    </p>
                </div>
                <div className="col-md-4">
                    <h3>Giao hàng nhanh chóng</h3>
                    <p>
                        Chúng tôi hợp tác với các đơn vị vận chuyển uy tín để đảm bảo rằng đơn hàng của bạn sẽ được giao đến tận nơi một cách nhanh chóng và an toàn.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default About;
