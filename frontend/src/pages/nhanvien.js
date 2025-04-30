import React, { useState, useEffect } from "react";
import {
  Package,
  LogOut,
  Folder,
  Factory,
  Settings2,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import axios from "axios";
import "./style/nhanvien.css";
import { API_BASE_URL } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const StaffDashboard = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("category");
  const [viewMode, setViewMode] = useState("grid");

  const [categories, setCategories] = useState([]);
  const [hangSanXuats, setHangSanXuats] = useState([]);
  const [thongSos, setThongSos] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [categoryData, setCategoryData] = useState({ TenDanhMuc: "", MoTa: "" });
  const [hangSanXuatData, setHangSanXuatData] = useState({ TenHangSanXuat: "" });
  const [thongSoData, setThongSoData] = useState({ TenThongSo: "" });
  const [productData, setProductData] = useState({
    TenSanPham: "",
    MoTa: "",
    GiaBan: "",
    SoLuongTon: "",
    DanhMuc: "",
    HangSanXuat: "",
    ThongSo: [],
    HinhAnh: null,
    selectedThongSo: "",
    thongSoValue: "",
  });

  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState("");
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState("");

  const statusMap = {
    1: t("choThanhToan"),
    2: t("daThanhToan"),
    3: t("dangXuLy"),
    4: t("dangVanChuyen"),
    5: t("daGiaoHang"),
    6: t("daHuy"),
    7: t("hoanTien"),
  };

  const getOrderCountByStatus = (status) => {
    return orders.filter((order) => order.MaTrangThai === status).length;
  };

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      switch (activeSection) {
        case "category":
          const categoriesRes = await axios.get(
            `${API_BASE_URL}/products/danh-muc/`
          );
          setCategories(categoriesRes.data);
          break;
        case "hangSanXuat":
          const hangSanXuatsRes = await axios.get(
            `${API_BASE_URL}/products/hang-san-xuat/`
          );
          setHangSanXuats(hangSanXuatsRes.data);
          break;
        case "thongSo":
          const thongSosRes = await axios.get(
            `${API_BASE_URL}/products/thong-so/`
          );
          setThongSos(thongSosRes.data);
          break;
        case "product":
          const [
            productsRes,
            categoriesForProductRes,
            hangSanXuatsForProductRes,
            thongSosForProductRes,
          ] = await Promise.all([
            axios.get(`${API_BASE_URL}/products/san-pham/`),
            axios.get(`${API_BASE_URL}/products/danh-muc/`),
            axios.get(`${API_BASE_URL}/products/hang-san-xuat/`),
            axios.get(`${API_BASE_URL}/products/thong-so/`),
          ]);
          setProducts(productsRes.data);
          setCategories(categoriesForProductRes.data);
          setHangSanXuats(hangSanXuatsForProductRes.data);
          setThongSos(thongSosForProductRes.data);
          break;
        case "order-choThanhToan":
        case "order-daThanhToan":
        case "order-dangXuLy":
        case "order-dangVanChuyen":
        case "order-daGiaoHang":
        case "order-daHuy":
        case "order-hoanTien":
          const ordersRes = await axios.get(
            `${API_BASE_URL}/orders/list-orders/`
          );
          setOrders(ordersRes.data.orders);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setErrorMessage(t("khongTheLayDuLieu"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    switch (activeSection) {
      case "category":
        setCategoryData({ TenDanhMuc: "", MoTa: "" });
        break;
      case "hangSanXuat":
        setHangSanXuatData({ TenHangSanXuat: "" });
        break;
      case "thongSo":
        setThongSoData({ TenThongSo: "" });
        break;
      case "product":
        setProductData({
          TenSanPham: "",
          MoTa: "",
          GiaBan: "",
          SoLuongTon: "",
          DanhMuc: "",
          HangSanXuat: "",
          ThongSo: [],
          HinhAnh: null,
          selectedThongSo: "",
          thongSoValue: "",
        });
        break;
      default:
        break;
    }
    setIsEditing(false);
    setEditId(null);
  };

  const getBadgeClass = (section, badge) => {
    const highPriorityStatuses = [
      "order-choThanhToan",
      "order-daHuy",
      "order-hoanTien",
    ];
    return badge > 0
      ? highPriorityStatuses.includes(section)
        ? "high-priority"
        : ""
      : "";
  };

  const SidebarItem = ({ icon: Icon, label, section, badge }) => {
    const badgeClass = getBadgeClass(section, badge);

    return (
      <div
        className={`sidebar-item order-status ${
          activeSection === section ? "active" : ""
        }`}
        onClick={() => {
          setActiveSection(section);
          setViewMode("grid");
          resetForm();
          setErrorMessage("");
          setSuccessMessage("");
          setSearchTerm("");
          setStartDate("");
          setEndDate("");
        }}
      >
        <Icon className="sidebar-icon" />
        <span>{label}</span>
        {badge > 0 && (
          <span
            style={{
              backgroundColor: "#e63946",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
              padding: "2px 6px",
              borderRadius: "12px",
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "20px",
              height: "20px",
            }}
            className={badgeClass}
          >
            {badge}
          </span>
        )}
      </div>
    );
  };

  const handleInputChange = (type, field) => (e) => {
    setErrorMessage("");
    if (type === "category") {
      setCategoryData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === "hangSanXuat") {
      setHangSanXuatData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === "thongSo") {
      setThongSoData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === "product") {
      if (field === "HinhAnh") {
        setProductData((prev) => ({ ...prev, [field]: e.target.files[0] }));
      } else {
        setProductData((prev) => ({ ...prev, [field]: e.target.value }));
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (field) => (e) => {
    const value = e.target.value;
    if (field === "startDate") {
      setStartDate(value);
      if (endDate && new Date(value) > new Date(endDate)) {
        setErrorMessage(t("ngayBatDauPhaiNhoHonNgayKetThuc"));
      } else {
        setErrorMessage("");
      }
    } else if (field === "endDate") {
      setEndDate(value);
      if (startDate && new Date(value) < new Date(startDate)) {
        setErrorMessage(t("ngayKetThucPhaiLonHonNgayBatDau"));
      } else {
        setErrorMessage("");
      }
    }
  };

  const filteredData = () => {
    let filteredItems = [];
    switch (activeSection) {
      case "category":
        return categories.filter(
          (item) =>
            item.TenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.MoTa &&
              item.MoTa.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      case "hangSanXuat":
        return hangSanXuats.filter((item) =>
          item.TenHangSanXuat.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "thongSo":
        return thongSos.filter((item) =>
          item.TenThongSo.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case "product":
        return products.filter(
          (item) =>
            item.TenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.MoTa &&
              item.MoTa.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.TenDanhMuc &&
              item.TenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.TenHangSanXuat &&
              item.TenHangSanXuat.toLowerCase().includes(
                searchTerm.toLowerCase()
              ))
        );
      case "order-choThanhToan":
        filteredItems = orders.filter(
          (item) =>
            item.MaTrangThai === 1 &&
            (item.TenNguoiNhan.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
              item.SoDienThoai.toLowerCase().includes(
                searchTerm.toLowerCase()
              ) ||
              item.DiaChi.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        break;
      case "order-daThanhToan":
        filteredItems = orders.filter(
          (item) =>
            item.MaTrangThai === 2 &&
            (item.TenNguoiNhan.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
              item.SoDienThoai.toLowerCase().includes(
                searchTerm.toLowerCase()
              ) ||
              item.DiaChi.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        break;
      case "order-dangXuLy":
        filteredItems = orders.filter(
          (item) =>
            item.MaTrangThai === 3 &&
            (item.TenNguoiNhan.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
              item.SoDienThoai.toLowerCase().includes(
                searchTerm.toLowerCase()
              ) ||
              item.DiaChi.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        break;
      case "order-dangVanChuyen":
        filteredItems = orders.filter(
          (item) =>
            item.MaTrangThai === 4 &&
            (item.TenNguoiNhan.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
              item.SoDienThoai.toLowerCase().includes(
                searchTerm.toLowerCase()
              ) ||
              item.DiaChi.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        break;
      case "order-daGiaoHang":
        filteredItems = orders.filter(
          (item) =>
            item.MaTrangThai === 5 &&
            (item.TenNguoiNhan.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
              item.SoDienThoai.toLowerCase().includes(
                searchTerm.toLowerCase()
              ) ||
              item.DiaChi.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        break;
      case "order-daHuy":
        filteredItems = orders.filter(
          (item) =>
            item.MaTrangThai === 6 &&
            (item.TenNguoiNhan.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
              item.SoDienThoai.toLowerCase().includes(
                searchTerm.toLowerCase()
              ) ||
              item.DiaChi.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        break;
      case "order-hoanTien":
        filteredItems = orders.filter(
          (item) =>
            item.MaTrangThai === 7 &&
            (item.TenNguoiNhan.toLowerCase().includes(
              searchTerm.toLowerCase()
            ) ||
              item.SoDienThoai.toLowerCase().includes(
                searchTerm.toLowerCase()
              ) ||
              item.DiaChi.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        break;
      default:
        return [];
    }

    if (startDate || endDate) {
      filteredItems = filteredItems.filter((item) => {
        const orderDate = new Date(item.NgayDatHang);
        orderDate.setHours(0, 0, 0, 0);

        const start = startDate ? new Date(startDate) : null;
        if (start) start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        if (start && end) {
          return orderDate >= start && orderDate <= end;
        } else if (start) {
          return orderDate >= start;
        } else if (end) {
          return orderDate <= end;
        }
        return true;
      });
    }

    return filteredItems;
  };

  const handleEdit = (type, id) => {
    setIsEditing(true);
    setEditId(id);
    setViewMode("form");

    switch (type) {
      case "category":
        const category = categories.find((c) => c.id === id);
        if (category) {
          setCategoryData({
            TenDanhMuc: category.TenDanhMuc,
            MoTa: category.MoTa || "",
          });
        }
        break;
      case "hangSanXuat":
        const hangSanXuat = hangSanXuats.find((h) => h.id === id);
        if (hangSanXuat) {
          setHangSanXuatData({
            TenHangSanXuat: hangSanXuat.TenHangSanXuat,
          });
        }
        break;
      case "thongSo":
        const thongSo = thongSos.find((t) => t.id === id);
        if (thongSo) {
          setThongSoData({
            TenThongSo: thongSo.TenThongSo,
          });
        }
        break;
      case "product":
        const product = products.find((p) => p.id === id);
        if (product) {
          setProductData({
            TenSanPham: product.TenSanPham,
            MoTa: product.MoTa || "",
            GiaBan: product.GiaBan,
            SoLuongTon: product.SoLuongTon,
            DanhMuc: product.DanhMuc || "",
            HangSanXuat: product.HangSanXuat || "",
            ThongSo: product.ChiTietThongSo || [],
            HinhAnh: null,
            selectedThongSo: "",
            thongSoValue: "",
          });
        }
        break;
      default:
        break;
    }
  };

  const confirmDelete = (type, id, name) => {
    setDeleteItemType(type);
    setDeleteItemId(id);
    setDeleteItemName(name);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    let url = "";
    let successMessage = "";
    let errorMessage = "";

    switch (deleteItemType) {
      case "category":
        url = `${API_BASE_URL}/products/danh-muc/${deleteItemId}/`;
        successMessage = t("xoaDanhMucThanhCong");
        errorMessage = t("xoaDanhMucThatBai");
        break;
      case "hangSanXuat":
        url = `${API_BASE_URL}/products/hang-san-xuat/${deleteItemId}/`;
        successMessage = t("xoaHangSanXuatThanhCong");
        errorMessage = t("xoaHangSanXuatThatBai");
        break;
      case "thongSo":
        url = `${API_BASE_URL}/products/thong-so/${deleteItemId}/`;
        successMessage = t("xoaThongSoThanhCong");
        errorMessage = t("xoaThongSoThatBai");
        break;
      case "product":
        url = `${API_BASE_URL}/products/san-pham/${deleteItemId}/`;
        successMessage = t("xoaSanPhamThanhCong");
        errorMessage = t("xoaSanPhamThatBai");
        break;
      default:
        break;
    }

    try {
      await axios.delete(url);
      setSuccessMessage(successMessage);
      fetchData();
    } catch (error) {
      setErrorMessage(
        `${errorMessage}: ` +
          (error.response?.data?.detail || t("loiKhongXacDinh"))
      );
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (type, e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    let url = "";
    let data = {};
    let config = {};

    if (type === "category") {
      url = `${API_BASE_URL}/products/danh-muc/`;
      if (isEditing) url += `${editId}/`;
      data = categoryData;
      if (!data.TenDanhMuc) {
        setErrorMessage(t("vuiLongNhapTenDanhMuc"));
        setIsLoading(false);
        return;
      }
    } else if (type === "hangSanXuat") {
      url = `${API_BASE_URL}/products/hang-san-xuat/`;
      if (isEditing) url += `${editId}/`;
      data = hangSanXuatData;
      if (!data.TenHangSanXuat) {
        setErrorMessage(t("vuiLongNhapTenHangSanXuat"));
        setIsLoading(false);
        return;
      }
    } else if (type === "thongSo") {
      url = `${API_BASE_URL}/products/thong-so/`;
      if (isEditing) url += `${editId}/`;
      data = thongSoData;
      if (!data.TenThongSo) {
        setErrorMessage(t("vuiLongNhapTenThongSo"));
        setIsLoading(false);
        return;
      }
    } else if (type === "product") {
      url = `${API_BASE_URL}/products/san-pham/`;
      if (isEditing) url += `${editId}/`;
      data = new FormData();
      data.append("TenSanPham", productData.TenSanPham);
      data.append("MoTa", productData.MoTa);
      data.append("GiaBan", productData.GiaBan);
      data.append("SoLuongTon", productData.SoLuongTon);
      if (productData.DanhMuc) data.append("DanhMuc", productData.DanhMuc);
      if (productData.HangSanXuat)
        data.append("HangSanXuat", productData.HangSanXuat);

      if (productData.ThongSo && productData.ThongSo.length > 0) {
        data.append("ChiTietThongSo", JSON.stringify(productData.ThongSo));
      }

      if (productData.HinhAnh) data.append("HinhAnh", productData.HinhAnh);
      config = { headers: { "Content-Type": "multipart/form-data" } };

      if (
        !data.get("TenSanPham") ||
        !data.get("MoTa") ||
        !data.get("GiaBan") ||
        !data.get("SoLuongTon")
      ) {
        setErrorMessage(t("vuiLongNhapDayDuThongTinSanPham"));
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isEditing) {
        await axios.put(url, data, config);
        setSuccessMessage(t(`capNhat${type}ThanhCong`));
      } else {
        await axios.post(url, data, config);
        setSuccessMessage(t(`them${type}ThanhCong`));
      }

      resetForm();
      fetchData();
      setViewMode("grid");
    } catch (error) {
      setErrorMessage(
        `${isEditing ? t("capNhat") : t("them")}${type}ThatBai: ` +
          (error.response?.data?.detail || t("loiKhongXacDinh"))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateStatusModal = (orderId, currentStatus) => {
    if (currentStatus === 5 || currentStatus === 6 || currentStatus === 7) {
      setErrorMessage(t("khongTheCapNhatTrangThaiNay"));
      return;
    }
    setSelectedOrderId(orderId);
    setNewStatus((currentStatus + 1).toString());
    setShowUpdateStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/orders/update-status/${selectedOrderId}/`,
        { MaTrangThai: parseInt(newStatus) }
      );

      if (response.status === 200) {
        setSuccessMessage(t("capNhatTrangThaiThanhCong"));
        fetchData();
        setShowUpdateStatusModal(false);
      }
    } catch (error) {
      setErrorMessage(
        t("capNhatTrangThaiThatBai") +
          ": " +
          (error.response?.data?.detail || t("loiKhongXacDinh"))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderGridView = () => {
    const items = filteredData();

    switch (activeSection) {
      case "category":
        return (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-search">
                <input
                  type="text"
                  placeholder={t("timKiemDanhMuc")}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <Search className="search-icon" />
              </div>
              <button
                className="btn btn-add"
                onClick={() => {
                  resetForm();
                  setViewMode("form");
                }}
              >
                <PlusCircle size={16} />
                {t("themDanhMuc")}
              </button>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("tenDanhMuc")}</th>
                    <th>{t("moTa")}</th>
                    <th>{t("ngayTao")}</th>
                    <th>{t("hanhDong")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.TenDanhMuc}</td>
                        <td>{item.MoTa}</td>
                        <td>
                          {new Date(item.NgayTao).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit("category", item.id)}
                          >
                            <Edit size={16} />
                            {t("suaDanhMuc")}
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() =>
                              confirmDelete(
                                "category",
                                item.id,
                                item.TenDanhMuc
                              )
                            }
                          >
                            <Trash2 size={16} />
                            {t("xoaDanhMuc")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">
                        {t("khongCoDuLieu")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "hangSanXuat":
        return (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-search">
                <input
                  type="text"
                  placeholder={t("timKiemHangSanXuat")}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <Search className="search-icon" />
              </div>
              <button
                className="btn btn-add"
                onClick={() => {
                  resetForm();
                  setViewMode("form");
                }}
              >
                <PlusCircle size={16} />
                {t("themHangSanXuat")}
              </button>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("tenHangSanXuat")}</th>
                    <th>{t("hanhDong")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.TenHangSanXuat}</td>
                        <td className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit("hangSanXuat", item.id)}
                            aria-label="Sửa"
                          >
                            <Edit size={16} />
                            {t("suaHangSanXuat")}
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() =>
                              confirmDelete(
                                "hangSanXuat",
                                item.id,
                                item.TenHangSanXuat
                              )
                            }
                            aria-label="Xóa"
                          >
                            <Trash2 size={16} />
                            {t("xoaHangSanXuat")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">
                        {t("khongCoDuLieu")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "thongSo":
        return (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-search">
                <input
                  type="text"
                  placeholder={t("timKiemThongSo")}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <Search className="search-icon" />
              </div>
              <button
                className="btn btn-add"
                onClick={() => {
                  resetForm();
                  setViewMode("form");
                }}
              >
                <PlusCircle size={16} />
                {t("themThongSo")}
              </button>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("tenThongSo")}</th>
                    <th>{t("hanhDong")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.TenThongSo}</td>
                        <td className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit("thongSo", item.id)}
                          >
                            <Edit size={16} />
                            {t("suaThongSo")}
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() =>
                              confirmDelete("thongSo", item.id, item.TenThongSo)
                            }
                          >
                            <Trash2 size={16} />
                            {t("xoaThongSo")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">
                        {t("khongCoDuLieu")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "product":
        return (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-search">
                <input
                  type="text"
                  placeholder={t("timKiemSanPham")}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <Search className="search-icon" />
              </div>
              <button
                className="btn btn-add"
                onClick={() => {
                  resetForm();
                  setViewMode("form");
                }}
              >
                <PlusCircle size={16} />
                {t("themSanPham")}
              </button>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("hinhAnh")}</th>
                    <th>{t("tenSanPham")}</th>
                    <th>{t("giaBan")}</th>
                    <th>{t("tonKho")}</th>
                    <th>{t("danhMuc")}</th>
                    <th>{t("hangSanXuat")}</th>
                    <th>{t("hanhDong")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                          {item.HinhAnh_URL ? (
                            <img
                              src={item.HinhAnh_URL}
                              alt={item.TenSanPham}
                              className="product-thumbnail"
                            />
                          ) : (
                            <div className="no-image">{t("khongCoHinhAnh")}</div>
                          )}
                        </td>
                        <td>{item.TenSanPham}</td>
                        <td>
                          {parseInt(item.GiaBan).toLocaleString("vi-VN")} đ
                        </td>
                        <td>{item.SoLuongTon}</td>
                        <td>{item.TenDanhMuc || "N/A"}</td>
                        <td>{item.TenHangSanXuat || "N/A"}</td>
                        <td className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit("product", item.id)}
                          >
                            <Edit size={16} />
                            {t("suaSanPham")}
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() =>
                              confirmDelete("product", item.id, item.TenSanPham)
                            }
                          >
                            <Trash2 size={16} />
                            {t("xoaSanPham")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        {t("khongCoDuLieu")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "order-choThanhToan":
      case "order-daThanhToan":
      case "order-dangXuLy":
      case "order-dangVanChuyen":
      case "order-daGiaoHang":
      case "order-daHuy":
      case "order-hoanTien":
        return (
          <div className="grid-container">
            <div className="grid-header" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div className="grid-search" style={{ flex: "1", maxWidth: "300px" }}>
                <input
                  type="text"
                  placeholder={t("timKiemTheoTenKhachHang")}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <Search className="search-icon" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", color: "#4b5563" }}>{t("tuNgay")}:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleDateChange("startDate")}
                  className="search-input"
                  style={{ width: "150px", padding: "8px" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", color: "#4b5563" }}>{t("denNgay")}:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleDateChange("endDate")}
                  className="search-input"
                  style={{ width: "150px", padding: "8px" }}
                />
              </div>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t("tenKhachHang")}</th>
                    <th>{t("soDienThoai")}</th>
                    <th>{t("diaChi")}</th>
                    <th>{t("tongTien")}</th>
                    <th>{t("trangThai")}</th>
                    <th>{t("ngayDatHang")}</th>
                    <th>{t("hanhDong")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.MaDonHang}>
                        <td>{item.MaDonHang}</td>
                        <td>{item.TenNguoiNhan}</td>
                        <td>{item.SoDienThoai}</td>
                        <td>{item.DiaChi}</td>
                        <td>
                          {parseInt(item.TongTien).toLocaleString("vi-VN")} đ
                          {parseInt(item.TongTien) === 0 && (
                            <span className="text-warning ms-2">
                              ({t("tongTienKhongHopLe")})
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${item.MaTrangThai}`}
                          >
                            {statusMap[item.MaTrangThai] || t("khongXacDinh")}
                          </span>
                        </td>
                        <td>
                          {new Date(item.NgayDatHang).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() =>
                              openUpdateStatusModal(
                                item.MaDonHang,
                                item.MaTrangThai
                              )
                            }
                            disabled={
                              item.MaTrangThai === 5 ||
                              item.MaTrangThai === 6 ||
                              item.MaTrangThai === 7
                            }
                          >
                            <Edit size={16} />
                            {t("suaTrangThai")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        {t("khongCoDuLieu")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFormView = () => {
    switch (activeSection) {
      case "category":
        return (
          <div className="form-card">
            <div className="form-header">
              <h2>
                <Folder className="form-icon" />
                {isEditing ? t("suaDanhMuc") : t("themDanhMuc")}
              </h2>
              <button
                className="btn-back"
                onClick={() => {
                  resetForm();
                  setViewMode("grid");
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit("category", e)}>
              <div className="form-group">
                <label>{t("tenDanhMuc")}</label>
                <input
                  type="text"
                  value={categoryData.TenDanhMuc}
                  onChange={handleInputChange("category", "TenDanhMuc")}
                  placeholder={t("nhapTenDanhMuc")}
                />
              </div>
              <div className="form-group">
                <label>{t("moTa")}</label>
                <textarea
                  value={categoryData.MoTa}
                  onChange={handleInputChange("category", "MoTa")}
                  placeholder={t("nhapMoTaDanhMuc")}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    resetForm();
                    setViewMode("grid");
                  }}
                >
                  {t("huy")}
                </button>
                <button
                  type="submit"
                  className="btn btn-category"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="spinner" size={16} />
                  ) : (
                    <>{isEditing ? t("capNhat") : t("them")} {t("danhMuc")}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case "thongSo":
        return (
          <div className="form-card">
            <div className="form-header">
              <h2>
                <Settings2 className="form-icon" />
                {isEditing ? t("suaThongSo") : t("themThongSo")}
              </h2>
              <button
                className="btn-back"
                onClick={() => {
                  resetForm();
                  setViewMode("grid");
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit("thongSo", e)}>
              <div className="form-group">
                <label>{t("tenThongSo")}</label>
                <input
                  type="text"
                  value={thongSoData.TenThongSo}
                  onChange={handleInputChange("thongSo", "TenThongSo")}
                  placeholder={t("nhapTenThongSo")}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    resetForm();
                    setViewMode("grid");
                  }}
                >
                  {t("huy")}
                </button>
                <button
                  type="submit"
                  className="btn btn-thongSo"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="spinner" size={16} />
                  ) : (
                    <>{isEditing ? t("capNhat") : t("them")} {t("thongSo")}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case "hangSanXuat":
        return (
          <div className="form-card">
            <div className="form-header">
              <h2>
                <Factory className="form-icon" />
                {isEditing ? t("suaHangSanXuat") : t("themHangSanXuat")}
              </h2>
              <button
                className="btn-back"
                onClick={() => {
                  resetForm();
                  setViewMode("grid");
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit("hangSanXuat", e)}>
              <div className="form-group">
                <label>{t("tenHangSanXuat")}</label>
                <input
                  type="text"
                  value={hangSanXuatData.TenHangSanXuat}
                  onChange={handleInputChange("hangSanXuat", "TenHangSanXuat")}
                  placeholder={t("nhapTenHangSanXuat")}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    resetForm();
                    setViewMode("grid");
                  }}
                >
                  {t("huy")}
                </button>
                <button
                  type="submit"
                  className="btn btn-hangSanXuat"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="spinner" size={16} />
                  ) : (
                    <>
                      {isEditing ? t("capNhat") : t("them")}{" "}
                      {t("hangSanXuat")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case "product":
        return (
          <div className="form-card form-card-product">
            <div className="form-header">
              <h2>
                <PlusCircle className="form-icon" />
                {isEditing ? t("suaSanPham") : t("themSanPham")}
              </h2>
              <button
                className="btn-back"
                onClick={() => {
                  resetForm();
                  setViewMode("grid");
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => handleSubmit("product", e)}
              className="form-columns"
            >
              <div className="form-column">
                <div className="form-group">
                  <label>{t("tenSanPham")}</label>
                  <input
                    type="text"
                    value={productData.TenSanPham}
                    onChange={handleInputChange("product", "TenSanPham")}
                    placeholder={t("nhapTenSanPham")}
                  />
                </div>
                <div className="form-group">
                  <label>{t("moTa")}</label>
                  <textarea
                    value={productData.MoTa}
                    onChange={handleInputChange("product", "MoTa")}
                    placeholder={t("nhapMoTaSanPham")}
                  />
                </div>
                <div className="form-group">
                  <label>{t("giaBan")}</label>
                  <input
                    type="number"
                    value={productData.GiaBan}
                    onChange={handleInputChange("product", "GiaBan")}
                    placeholder={t("nhapGiaSanPham")}
                  />
                </div>
                <div className="form-group">
                  <label>{t("soLuongTonKho")}</label>
                  <input
                    type="number"
                    value={productData.SoLuongTon}
                    onChange={handleInputChange("product", "SoLuongTon")}
                    placeholder={t("nhapSoLuongTonKho")}
                  />
                </div>
              </div>
              <div className="form-column">
                <div className="form-group">
                  <label>{t("danhMuc")}</label>
                  <select
                    value={productData.DanhMuc}
                    onChange={handleInputChange("product", "DanhMuc")}
                  >
                    <option value="">{t("chonDanhMuc")}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.TenDanhMuc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t("hangSanXuat")}</label>
                  <select
                    value={productData.HangSanXuat}
                    onChange={handleInputChange("product", "HangSanXuat")}
                  >
                    <option value="">{t("chonHangSanXuat")}</option>
                    {hangSanXuats.map((hang) => (
                      <option key={hang.id} value={hang.id}>
                        {hang.TenHangSanXuat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t("thongSo")}</label>
                  <select
                    value={productData.selectedThongSo || ""}
                    onChange={(e) => {
                      const thongSoId = e.target.value;
                      if (thongSoId) {
                        setProductData((prev) => ({
                          ...prev,
                          selectedThongSo: thongSoId,
                        }));
                      }
                    }}
                  >
                    <option value="">{t("chonThongSo")}</option>
                    {thongSos.map((thongSo) => (
                      <option key={thongSo.id} value={thongSo.id}>
                        {thongSo.TenThongSo}
                      </option>
                    ))}
                  </select>
                </div>
                {productData.selectedThongSo && (
                  <div className="form-group">
                    <label>{t("giaTriThongSo")}</label>
                    <div className="thong-so-value-container">
                      <input
                        type="text"
                        placeholder={t("nhapGiaTriThongSo")}
                        value={productData.thongSoValue || ""}
                        onChange={(e) =>
                          setProductData((prev) => ({
                            ...prev,
                            thongSoValue: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-add-thong-so"
                        onClick={() => {
                          if (
                            productData.selectedThongSo &&
                            productData.thongSoValue
                          ) {
                            const newThongSo = {
                              ThongSo: productData.selectedThongSo,
                              GiaTriThongSo: productData.thongSoValue,
                            };
                            setProductData((prev) => ({
                              ...prev,
                              ThongSo: [...prev.ThongSo, newThongSo],
                              selectedThongSo: "",
                              thongSoValue: "",
                            }));
                          }
                        }}
                      >
                        {t("them")}
                      </button>
                    </div>
                  </div>
                )}

                {productData.ThongSo && productData.ThongSo.length > 0 && (
                  <div className="form-group">
                    <label>{t("thongSoDaThem")}</label>
                    <div className="thong-so-list">
                      {productData.ThongSo.map((ts, index) => {
                        const thongSoInfo = thongSos.find(
                          (t) => t.id === parseInt(ts.ThongSo)
                        );
                        return (
                          <div key={index} className="thong-so-item">
                            {thongSoInfo?.TenThongSo}: {ts.GiaTriThongSo}
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => {
                                setProductData((prev) => ({
                                  ...prev,
                                  ThongSo: prev.ThongSo.filter(
                                    (_, i) => i !== index
                                  ),
                                }));
                              }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>{t("hinhAnh")}</label>
                  <input
                    type="file"
                    onChange={handleInputChange("product", "HinhAnh")}
                    accept="image/*"
                  />
                  {isEditing && (
                    <div className="file-note">
                      {t("deTrongNeuKhongMuonThayDoiHinhAnh")}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions full-width">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    resetForm();
                    setViewMode("grid");
                  }}
                >
                  {t("huy")}
                </button>
                <button
                  type="submit"
                  className="btn btn-product"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="spinner" size={16} />
                  ) : (
                    <>{isEditing ? t("capNhat") : t("them")} {t("sanPham")}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    return viewMode === "grid" ? renderGridView() : renderFormView();
  };

  const renderUpdateStatusModal = () => {
    if (!showUpdateStatusModal) return null;

    const currentStatus = parseInt(newStatus) - 1;
    const nextStatus = parseInt(newStatus);

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <AlertCircle className="modal-icon" />
            <h3>{t("capNhatTrangThaiDonHang")}</h3>
            <button
              className="btn-close"
              onClick={() => setShowUpdateStatusModal(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>{t("trangThaiHienTai")}</label>
              <input type="text" value={statusMap[currentStatus]} disabled />
            </div>
            <div className="form-group">
              <label>{t("trangThaiMoi")}</label>
              <input type="text" value={statusMap[nextStatus]} disabled />
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-cancel"
              onClick={() => setShowUpdateStatusModal(false)}
            >
              {t("huy")}
            </button>
            <button
              className="btn btn-confirm"
              onClick={handleUpdateStatus}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="spinner" size={16} />
              ) : (
                t("capNhat")
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <AlertCircle className="modal-icon" />
            <h3>{t("xacNhanXoa")}</h3>
            <button
              className="btn-close"
              onClick={() => setShowDeleteModal(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="modal-body">
            <p>
              {t("banCoChacChanMuonXoa")} <strong>{deleteItemName}</strong>?
            </p>
            <p className="warning-text">{t("hanhDongNayKhongTheHoanTac")}</p>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-cancel"
              onClick={() => setShowDeleteModal(false)}
            >
              {t("huy")}
            </button>
            <button
              className="btn btn-confirm-delete"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="spinner" size={16} />
              ) : (
                t("xoa")
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="staff-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{t("nhanVienDashboard")}</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-category">
            <Package className="sidebar-icon" />
            <span>{t("xuLySanPham")}</span>
          </div>
          <div className="sidebar-subitem">
            <SidebarItem icon={Folder} label={t("danhMuc")} section="category" />
            <SidebarItem
              icon={Factory}
              label={t("hangSanXuat")}
              section="hangSanXuat"
            />
            <SidebarItem
              icon={Settings2}
              label={t("thongSo")}
              section="thongSo"
            />
            <SidebarItem
              icon={PlusCircle}
              label={t("sanPham")}
              section="product"
            />
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-category">
            <ShoppingBag className="sidebar-icon" />
            <span>{t("quanLyDonHang")}</span>
          </div>
          <div className="sidebar-subitem">
            <SidebarItem
              icon={ShoppingBag}
              label={t("choThanhToan")}
              section="order-choThanhToan"
              badge={getOrderCountByStatus(1)}
            />
            <SidebarItem
              icon={ShoppingBag}
              label={t("daThanhToan")}
              section="order-daThanhToan"
              badge={getOrderCountByStatus(2)}
            />
            <SidebarItem
              icon={ShoppingBag}
              label={t("dangXuLy")}
              section="order-dangXuLy"
              badge={getOrderCountByStatus(3)}
            />
            <SidebarItem
              icon={ShoppingBag}
              label={t("dangVanChuyen")}
              section="order-dangVanChuyen"
              badge={getOrderCountByStatus(4)}
            />
            <SidebarItem
              icon={ShoppingBag}
              label={t("daGiaoHang")}
              section="order-daGiaoHang"
              badge={getOrderCountByStatus(5)}
            />
            <SidebarItem
              icon={ShoppingBag}
              label={t("daHuy")}
              section="order-daHuy"
              badge={getOrderCountByStatus(6)}
            />
            <SidebarItem
              icon={ShoppingBag}
              label={t("hoanTien")}
              section="order-hoanTien"
              badge={getOrderCountByStatus(7)}
            />
          </div>
          <div className="sidebar-divider"></div>
          <div
            className="sidebar-item"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            <LogOut className="sidebar-icon" />
            <span>{t("dangXuat")}</span>
          </div>
        </nav>
      </div>

      <div className="content">
        <h1>
          {activeSection === "category" && t("quanLyDanhMuc")}
          {activeSection === "hangSanXuat" && t("quanLyHangSanXuat")}
          {activeSection === "thongSo" && t("quanLyThongSo")}
          {activeSection === "product" && t("quanLySanPham")}
          {activeSection === "order-choThanhToan" && t("donHangChoThanhToan")}
          {activeSection === "order-daThanhToan" && t("donHangDaThanhToan")}
          {activeSection === "order-dangXuLy" && t("donHangDangXuLy")}
          {activeSection === "order-dangVanChuyen" &&
            t("donHangDangVanChuyen")}
          {activeSection === "order-daGiaoHang" && t("donHangDaGiaoHang")}
          {activeSection === "order-daHuy" && t("donHangDaHuy")}
          {activeSection === "order-hoanTien" && t("donHangHoanTien")}
        </h1>
        {renderContent()}

        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            {errorMessage}
            <button
              className="btn-close-alert"
              onClick={() => setErrorMessage("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            {successMessage}
            <button
              className="btn-close-alert"
              onClick={() => setSuccessMessage("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {renderDeleteModal()}
        {renderUpdateStatusModal()}
      </div>
    </div>
  );
};

export default StaffDashboard;