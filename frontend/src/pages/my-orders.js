import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faEye,
  faSpinner,
  faBoxOpen,
  faCheckCircle,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages/style/dashboard.css";

const MyOrdersStyles = `
  .my-orders-container {
    background-color: #f8fafc;
    min-height: 100vh;
    padding: 100px 0 40px 0; /* Thêm padding-top để tránh bị navbar che */
  }

  .orders-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .orders-header h2 {
    color: #1e293b;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
  }

  .orders-header h2 svg {
    margin-right: 15px;
    color: #007bff;
  }

  .order-stats {
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .order-stat-item {
    text-align: center;
    flex: 1;
    padding: 0 15px;
    border-right: 1px solid #e5e7eb;
  }

  .order-stat-item:last-child {
    border-right: none;
  }

  .order-stat-item h4 {
    color: #4b5563;
    margin-bottom: 10px;
    font-size: 16px;
    text-transform: uppercase;
  }

  .order-stat-item p {
    color: #1e293b;
    font-size: 22px;
    font-weight: 700;
  }

  .status-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px; /* Khoảng cách giữa các badge trạng thái */
    justify-content: center;
  }

  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .status-pending {
    background-color: #fef3c7;
    color: #d97706;
  }

  .status-completed {
    background-color: #d1fae5;
    color: #047857;
  }

  .status-cancelled {
    background-color: #fee2e2;
    color: #b91c1c;
  }

  .order-card {
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 25px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .order-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f1f5f9;
    padding: 15px 25px;
    border-bottom: 1px solid #e5e7eb;
  }

  .order-status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .order-details {
    padding: 20px 25px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .order-details p {
    margin: 0;
    color: #4b5563;
    font-size: 14px;
    display: flex;
    align-items: center;
  }

  .order-details p strong {
    color: #1e293b;
    margin-right: 10px;
    min-width: 120px;
    display: inline-block;
  }

  .order-items {
    background-color: #f8fafc;
    padding: 20px 25px;
    border-top: 1px solid #e5e7eb;
  }

  .order-items h6 {
    color: #1e293b;
    margin-bottom: 15px;
    font-weight: 600;
  }

  .order-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .order-item:last-child {
    border-bottom: none;
  }

  .order-item img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .order-item-details {
    flex-grow: 1;
  }

  .order-item-details p {
    margin: 5px 0;
    color: #1e293b;
    font-size: 14px;
  }

  .btn-details {
    display: block;
    width: 100%;
    padding: 12px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-top: 15px;
  }

  .btn-details:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    color: #007bff;
  }

  .no-orders {
    text-align: center;
    color: #6b7280;
    padding: 50px;
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .error-message {
    text-align: center;
    color: #b91c1c;
    padding: 20px;
    background-color: #fee2e2;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    .my-orders-container {
      padding: 80px 0 20px 0; /* Giảm padding trên thiết bị di động */
    }

    .order-details {
      grid-template-columns: 1fr;
    }

    .order-stats {
      flex-direction: column;
    }

    .order-stat-item {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      padding: 15px 0;
    }

    .order-stat-item:last-child {
      border-bottom: none;
    }

    .status-list {
      flex-direction: column;
      align-items: center;
    }

    .status-badge {
      width: fit-content;
    }
  }
`;

function MyOrders() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    statuses: {},
  });

  // Ánh xạ trạng thái đơn hàng (đồng bộ với StaffDashboard.js)
  const statusMap = {
    1: { label: t("choThanhToan"), className: "status-pending" },
    2: { label: t("daThanhToan"), className: "status-pending" },
    3: { label: t("dangXuLy"), className: "status-pending" },
    4: { label: t("dangVanChuyen"), className: "status-pending" },
    5: { label: t("daGiaoHang"), className: "status-completed" },
    6: { label: t("daHuy"), className: "status-cancelled" },
    7: { label: t("hoanTien"), className: "status-cancelled" },
  };

  // Ánh xạ phương thức thanh toán
  const paymentMethodMap = {
    ewallet: t("viDienTu"),
    cash: t("tienMat"),
    banking: t("chuyenKhoan"),
  };

  useEffect(() => {
    if (!user) {
      localStorage.setItem("redirect_after_login", "/my-orders");
      navigate("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError(t("chuaDangNhap"));
          logout();
          navigate("/");
          return;
        }

        // Fetch order list
        const ordersResponse = await axios.get(
          `${API_BASE_URL}/orders/user/${user.mataikhoan}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch order info for stats
        const orderInfoResponse = await axios.get(
          `${API_BASE_URL}/orders/user/${user.mataikhoan}/info/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrders(ordersResponse.data);

        // Process order stats
        const infoData = orderInfoResponse.data;
        setOrderStats({
          totalOrders: infoData.total_orders || 0,
          totalAmount: infoData.total_amount || 0,
          statuses: infoData.order_status_summary
            ? infoData.order_status_summary.reduce((acc, status) => {
                const statusLabel = statusMap[status.MaTrangThai]?.label || status.MaTrangThai__TenTrangThai;
                acc[statusLabel] = status.count;
                return acc;
              }, {})
            : {},
        });

        setError("");
      } catch (err) {
        console.error("Error fetching orders:", err);
        if (err.response?.status === 401) {
          setError(t("khongCoQuyenTruyCap"));
          logout();
          navigate("/");
        } else {
          setError(
            t("loiKhiLayDonHang") +
              ": " +
              (err.response?.data?.message || t("loiKhongXacDinh"))
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate, t, logout]);

  // Định dạng ngày giờ
  const formatDate = (dateString) => {
    if (!dateString) return t("khongXacDinh");
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t("khongXacDinh");
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount) => {
    if (amount == null) return t("khongXacDinh");
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xử lý nhấp vào nút "Xem chi tiết"
  const handleViewDetails = (orderId) => {
    if (orderId) {
      navigate(`/order/${orderId}`);
    }
  };

  // Hàm xác định className cho trạng thái trong badge
  const getStatusClass = (statusLabel) => {
    const statusEntry = Object.entries(statusMap).find(
      ([_, value]) => value.label === statusLabel
    );
    return statusEntry ? statusEntry[1].className : "status-pending";
  };

  return (
    <>
      <style>{MyOrdersStyles}</style>
      <div className="container my-orders-container">
        <div className="orders-header">
          <h2>
            <FontAwesomeIcon icon={faShoppingBag} />
            {t("donHangCuaToi")}
          </h2>
        </div>

        {/* Order Statistics */}
        <div className="order-stats">
          <div className="order-stat-item">
            <h4>{t("tongSoDonHang")}</h4>
            <p>
              <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
              {orderStats.totalOrders}
            </p>
          </div>
          <div className="order-stat-item">
            <h4>{t("tongSoTien")}</h4>
            <p>
              <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
              {formatCurrency(orderStats.totalAmount)}
            </p>
          </div>
          <div className="order-stat-item">
            <h4>{t("trangThaiDonHang")}</h4>
            <div className="status-list">
              {Object.entries(orderStats.statuses).length > 0 ? (
                Object.entries(orderStats.statuses).map(([status, count]) => (
                  <span
                    key={status}
                    className={`status-badge ${getStatusClass(status)}`}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    {status}: {count}
                  </span>
                ))
              ) : (
                <span className="status-badge status-pending">
                  {t("khongCoDuLieu")}
                </span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3" />
            <p>{t("khongCoDonHang")}</p>
          </div>
        ) : (
          <div className="row">
            {orders.map((order) => (
              <div className="col-12" key={order.MaDonHang}>
                <div className="order-card">
                  <div className="order-header">
                    <h5>
                      {t("donHang")} #{order.MaDonHang || t("khongXacDinh")}
                    </h5>
                    <span
                      className={`order-status ${
                        statusMap[order.MaTrangThai]?.className ||
                        "status-pending"
                      }`}
                    >
                      {statusMap[order.MaTrangThai]?.label || t("khongXacDinh")}
                    </span>
                  </div>
                  <div className="order-details">
                    <p>
                      <strong>{t("ngayDatHang")}:</strong>
                      {formatDate(order.NgayDatHang)}
                    </p>
                    <p>
                      <strong>{t("tongTien")}:</strong>
                      {formatCurrency(order.TongTien)}
                    </p>
                    <p>
                      <strong>{t("nguoiNhan")}:</strong>{" "}
                      {order.TenNguoiNhan || t("khongXacDinh")}
                    </p>
                    <p>
                      <strong>{t("soDienThoai")}:</strong>{" "}
                      {order.SoDienThoai || t("khongXacDinh")}
                    </p>
                    <p>
                      <strong>{t("diaChi")}:</strong>{" "}
                      {order.DiaChi || t("khongXacDinh")}
                    </p>
                    <p>
                      <strong>{t("phuongThucThanhToan")}:</strong>{" "}
                      {paymentMethodMap[order.PhuongThucThanhToan] ||
                        order.PhuongThucThanhToan ||
                        t("khongXacDinh")}
                    </p>
                  </div>
                  <div className="order-items">
                    <h6>{t("sanPham")}</h6>
                    {order.chi_tiet && order.chi_tiet.length > 0 ? (
                      order.chi_tiet.map((item) => (
                        <div
                          className="order-item"
                          key={item.MaChiTietDonHang || item.TenSanPham}
                        >
                          {item.HinhAnh ? (
                            <img
                              src={item.HinhAnh}
                              alt={item.TenSanPham || t("sanPham")}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "/path/to/default/image.png"; // Thay bằng đường dẫn ảnh mặc định thực tế
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "60px",
                                height: "60px",
                                backgroundColor: "#e5e7eb",
                                borderRadius: "8px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginRight: "20px",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faBoxOpen}
                                color="#6b7280"
                              />
                            </div>
                          )}
                          <div className="order-item-details">
                            <p>
                              <strong>
                                {item.TenSanPham || t("sanPhamKhongXacDinh")}
                              </strong>
                            </p>
                            <p>
                              {t("soLuong")}: {item.SoLuong || 0}
                            </p>
                            <p>
                              {t("gia")}: {formatCurrency(item.GiaSanPham)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>{t("khongCoSanPham")}</p>
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      className="btn-details"
                      onClick={() => handleViewDetails(order.MaDonHang)}
                      disabled={!order.MaDonHang}
                    >
                      <FontAwesomeIcon icon={faEye} className="me-2" />
                      {t("xemChiTiet")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default MyOrders;