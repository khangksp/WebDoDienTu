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
  faUndo,
  faTimes,
  faBan
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages/style/dashboard.css";
import "./style/my_order.css";

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
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const statusMap = {
    1: { label: t("choThanhToan"), className: "status-pending" },
    2: { label: t("daThanhToan"), className: "status-pending" },
    3: { label: t("dangXuLy"), className: "status-pending" },
    4: { label: t("dangVanChuyen"), className: "status-pending" },
    5: { label: t("daGiaoHang"), className: "status-completed" },
    6: { label: t("daHuy"), className: "status-cancelled" },
    7: { label: t("hoanTien"), className: "status-cancelled" },
  };

  const paymentMethodMap = {
    stripe: t("stripe"),
    elecpay: t("viDienTu"),
    cash: t("tienMat"),
    banking: t("RandchuyenKhoan"),
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

        const ordersResponse = await axios.get(
          `${API_BASE_URL}/orders/user/${user.mataikhoan}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrders(ordersResponse.data);

        const orderInfoResponse = await axios.get(
          `${API_BASE_URL}/orders/user/${user.mataikhoan}/info/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const infoData = orderInfoResponse.data;
        setOrderStats({
          totalOrders: infoData.total_orders || 0,
          totalAmount: infoData.total_amount || 0,
          statuses: infoData.order_status_summary
            ? infoData.order_status_summary.reduce((acc, status) => {
                const statusLabel =
                  statusMap[status.MaTrangThai]?.label ||
                  status.MaTrangThai__TenTrangThai;
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

  const formatCurrency = (amount) => {
    if (amount == null) return t("khongXacDinh");
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleViewDetails = (order) => {
    if (order) {
      setSelectedOrder(order);
      setShowModal(true);
    }
  };

  const handleCancel = async (orderId) => {
    if (!orderId) return;
    if (!window.confirm(t("xacNhanHuyDonHang"))) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError(t("chuaDangNhap"));
        logout();
        navigate("/");
        return;
      }

      const order = orders.find((o) => o.MaDonHang === orderId);
      if (!order || !order.TongTien) {
        throw new Error(t("khongTimThayDonHangHoacTongTien"));
      }

      // Kiểm tra nếu là Stripe và trạng thái là "Đang xử lý" (MaTrangThai: 3)
      if (order.PhuongThucThanhToan === "stripe" && order.MaTrangThai === 3) {
        // Gọi API hoàn tiền qua Stripe
        const refundResponse = await axios.post(
          `${API_BASE_URL}/payments/refund/`,
          { order_id: orderId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Refund response:", refundResponse.data);

        // Cập nhật trạng thái đơn hàng thành "Hoàn tiền" (MaTrangThai: 7)
        await axios.put(
          `${API_BASE_URL}/orders/update-status/${orderId}/`,
          { MaTrangThai: 7 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert(t("huyDonHangThanhCong") + t("vaHoanTien"));
      } else if (order.PhuongThucThanhToan === "elecpay") {
        // Hoàn tiền cho ví điện tử
        const payload = {
          manguoidung: user.mataikhoan,
          sotien: order.TongTien.toString(),
        };

        const balanceResponse = await axios.post(
          `${API_BASE_URL}/auth/balance/add/`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Balance add response:", balanceResponse.data);

        // Cập nhật trạng thái đơn hàng thành "Hoàn tiền" (MaTrangThai: 7)
        await axios.put(
          `${API_BASE_URL}/orders/update-status/${orderId}/`,
          { MaTrangThai: 7 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert(t("huyDonHangThanhCong") + t("vaHoanTien"));
      } else {
        // Hủy đơn hàng cho các phương thức khác (cash, banking)
        await axios.put(
          `${API_BASE_URL}/orders/update-status/${orderId}/`,
          { MaTrangThai: 6 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert(t("huyDonHangThanhCong"));
      }

      // Cập nhật state orders
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.MaDonHang === orderId
            ? {
                ...order,
                MaTrangThai:
                  order.PhuongThucThanhToan === "stripe" ||
                  order.PhuongThucThanhToan === "elecpay"
                    ? 7
                    : 6,
              }
            : order
        )
      );

      // Cập nhật orderStats
      setOrderStats((prevStats) => {
        const newStatuses = { ...prevStats.statuses };
        const processingLabel = statusMap[3].label;
        const cancelledLabel = statusMap[6].label;
        const refundLabel = statusMap[7].label;

        if (newStatuses[processingLabel]) {
          newStatuses[processingLabel] = Math.max(
            0,
            newStatuses[processingLabel] - 1
          );
        }
        if (
          order.PhuongThucThanhToan === "stripe" ||
          order.PhuongThucThanhToan === "elecpay"
        ) {
          newStatuses[refundLabel] = (newStatuses[refundLabel] || 0) + 1;
        } else {
          newStatuses[cancelledLabel] = (newStatuses[cancelledLabel] || 0) + 1;
        }

        return { ...prevStats, statuses: newStatuses };
      });

      setError("");
    } catch (err) {
      console.error("Error cancelling order or refunding:", err);
      setError(
        t("loiKhiHuyDonHangHoacHoanTien") +
          ": " +
          (err.response?.data?.message || t("loiKhongXacDinh"))
      );
    }
  };

  const handleRefund = async (orderId) => {
    if (!orderId) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError(t("chuaDangNhap"));
        logout();
        navigate("/");
        return;
      }

      const order = orders.find((o) => o.MaDonHang === orderId);
      if (!order || !order.TongTien) {
        throw new Error(t("khongTimThayDonHangHoacTongTien"));
      }

      // Cập nhật trạng thái đơn hàng thành "Hoàn tiền" (MaTrangThai: 7)
      console.log("Updating order status for order ID:", orderId);
      console.log("New status:", 7);

      const statusResponse = await axios.put(
        `${API_BASE_URL}/orders/update-status/${orderId}/`,
        { MaTrangThai: 7 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Status update response:", statusResponse.data);

      // Chỉ hoàn tiền nếu phương thức thanh toán là ewallet
      if (order.PhuongThucThanhToan === "elecpay") {
        console.log("User info:", user);
        console.log("User ID:", user.mataikhoan);
        console.log("Order total:", order.TongTien);

        const payload = {
          manguoidung: user.mataikhoan,
          sotien: order.TongTien.toString(),
        };

        console.log("Balance add payload:", payload);

        const balanceResponse = await axios.post(
          `${API_BASE_URL}/auth/balance/add/`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Balance add response:", balanceResponse.data);

        alert(t("yeuCauHoanTienThanhCong"));
      } else {
        // Thông báo cho các phương thức thanh toán khác (cash, banking)
        alert(t("yeuCauHoanTienDaGui") + " " + t("lienHeHoTro"));
      }

      // Cập nhật state orders
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.MaDonHang === orderId
            ? { ...order, MaTrangThai: 7 }
            : order
        )
      );

      // Cập nhật orderStats
      setOrderStats((prevStats) => {
        const newStatuses = { ...prevStats.statuses };
        const deliveredLabel = statusMap[5].label;
        const refundLabel = statusMap[7].label;

        if (newStatuses[deliveredLabel]) {
          newStatuses[deliveredLabel] = Math.max(
            0,
            newStatuses[deliveredLabel] - 1
          );
        }
        newStatuses[refundLabel] = (newStatuses[refundLabel] || 0) + 1;

        return { ...prevStats, statuses: newStatuses };
      });
    } catch (err) {
      console.error("Error requesting refund:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        console.error("Error response headers:", err.response.headers);
      } else if (err.request) {
        console.error("Error request:", err.request);
      } else {
        console.error("Error message:", err.message);
      }

      setError(
        t("loiKhiYeuCauHoanTien") +
          ": " +
          (err.response?.data?.message || t("loiKhongXacDinh"))
      );
    }
  };

  const getStatusClass = (statusLabel) => {
    const statusEntry = Object.entries(statusMap).find(
      ([_, value]) => value.label === statusLabel
    );
    return statusEntry ? statusEntry[1].className : "status-pending";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const filteredOrders = selectedStatus
    ? orders.filter((order) => order.MaTrangThai === parseInt(selectedStatus))
    : orders;

  return (
    <div className="container my-orders-container">
      <div className="orders-header">
        <h2>
          <FontAwesomeIcon icon={faShoppingBag} />
          {t("donHangCuaToi")}
        </h2>
      </div>

      <div className="order-filter mb-4">
        <label htmlFor="statusFilter" className="me-2">
          {t("locTheoTrangThai")}:
        </label>
        <select
          id="statusFilter"
          className="form-select w-auto d-inline-block"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">{t("tatCa")}</option>
          {Object.entries(statusMap).map(([statusId, { label }]) => (
            <option key={statusId} value={statusId}>
              {label}
            </option>
          ))}
        </select>
      </div>

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
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">
          <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3" />
          <p>{t("khongCoDonHang")}</p>
        </div>
      ) : (
        <div className="row">
          {filteredOrders.map((order) => (
            <div className="col-12" key={order.MaDonHang}>
              <div className="order-card">
                <div className="order-header">
                  <h5>
                    {t("donHang")} #{order.MaDonHang || t("khongXacDinh")}
                  </h5>
                  <span
                    className={`order-status ${
                      statusMap[order.MaTrangThai]?.className || "status-pending"
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
                              e.target.src = "/path/to/default/image.png";
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
                            <FontAwesomeIcon icon={faBoxOpen} color="#6b7280" />
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
                  <div className="button-group">
                    <button
                      className="btn-details"
                      onClick={() => handleViewDetails(order)}
                      disabled={!order.MaDonHang}
                    >
                      <FontAwesomeIcon icon={faEye} className="me-2" />
                      {t("xemChiTiet")}
                    </button>
                    {order.MaTrangThai === 3 && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancel(order.MaDonHang)}
                        disabled={!order.MaDonHang}
                      >
                        <FontAwesomeIcon icon={faBan} className="me-2" />
                        {t("huyDonHang")}
                      </button>
                    )}
                    {order.MaTrangThai === 5 && (
                      <button
                        className="btn-refund"
                        onClick={() => handleRefund(order.MaDonHang)}
                        disabled={!order.MaDonHang}
                      >
                        <FontAwesomeIcon icon={faUndo} className="me-2" />
                        {t("hoanTien")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedOrder && (
        <div className="order-modal">
          <div className="order-modal-content">
            <button className="modal-close" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h5>
              {t("chiTietDonHang")} #{selectedOrder.MaDonHang || t("khongXacDinh")}
            </h5>
            <div className="order-modal-body">
              <p>
                <strong>{t("tongTien")}:</strong>{" "}
                {formatCurrency(selectedOrder.TongTien)}
              </p>
              <h6>{t("sanPham")}</h6>
              {selectedOrder.chi_tiet && selectedOrder.chi_tiet.length > 0 ? (
                selectedOrder.chi_tiet.map((item) => (
                  <div
                    className="modal-order-item"
                    key={item.MaChiTietDonHang || item.TenSanPham}
                  >
                    <p>
                      <strong>{t("tenSanPham")}:</strong>{" "}
                      {item.TenSanPham || t("sanPhamKhongXacDinh")}
                    </p>
                    <p>
                      <strong>{t("soLuong")}:</strong> {item.SoLuong || 0}
                    </p>
                    <p>
                      <strong>{t("gia")}:</strong>{" "}
                      {formatCurrency(item.GiaSanPham)}
                    </p>
                  </div>
                ))
              ) : (
                <p>{t("khongCoSanPham")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;