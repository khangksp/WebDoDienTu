import React, { useState, useEffect } from 'react';
import { 
  Package, 
  LogOut, 
  Folder, 
  Factory, 
  Settings2, 
  PlusCircle 
} from 'lucide-react';
import axios from 'axios';
import './style/nhanvien.css';
import { API_BASE_URL } from '../config';
const StaffDashboard = () => {
  const [activeSection, setActiveSection] = useState('category');

  // State cho danh sách dữ liệu từ API
  const [categories, setCategories] = useState([]);
  const [hangSanXuats, setHangSanXuats] = useState([]);
  const [thongSos, setThongSos] = useState([]);
  const [khuyenMais, setKhuyenMais] = useState([]);

  // State cho form
  const [categoryData, setCategoryData] = useState({ name: '', description: '' });
  const [hangSanXuatData, setHangSanXuatData] = useState({ TenHangSanXuat: '' });
  const [thongSoData, setThongSoData] = useState({ TenThongSo: '' });
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    hang_san_xuat: '',
    thong_so: '',
    khuyen_mai: '',
    image: null,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Lấy danh sách từ API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, hangSanXuatsRes, thongSosRes, khuyenMaisRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products/categories/`),
          axios.get(`${API_BASE_URL}/products/hang-san-xuat/`),
          axios.get(`${API_BASE_URL}/products/thong-so/`),
          axios.get(`${API_BASE_URL}/products/khuyen-mai/`), // Giả định endpoint này tồn tại
        ]);
        setCategories(categoriesRes.data);
        setHangSanXuats(hangSanXuatsRes.data);
        setThongSos(thongSosRes.data);
        setKhuyenMais(khuyenMaisRes.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setErrorMessage('Không thể lấy dữ liệu từ API');
      }
    };
    fetchData();
  }, []);

  const SidebarItem = ({ icon: Icon, label, section }) => (
    <div 
      className={`sidebar-item ${activeSection === section ? 'active' : ''}`} 
      onClick={() => setActiveSection(section)}
    >
      <Icon className="sidebar-icon" />
      <span>{label}</span>
    </div>
  );

  const handleInputChange = (type, field) => (e) => {
    if (type === 'category') {
      setCategoryData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === 'hangSanXuat') {
      setHangSanXuatData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === 'thongSo') {
      setThongSoData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === 'product') {
      if (field === 'image') {
        setProductData((prev) => ({ ...prev, [field]: e.target.files[0] }));
      } else {
        setProductData((prev) => ({ ...prev, [field]: e.target.value }));
      }
    }
  };

  const handleSubmit = async (type, e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let url = '';
    let data = {};
    let config = {};

    if (type === 'category') {
      url = `${API_BASE_URL}/products/categories/`;
      data = categoryData;
      if (!data.name || !data.description) {
        setErrorMessage('Vui lòng nhập đầy đủ thông tin danh mục');
        return;
      }
    } else if (type === 'hangSanXuat') {
      url = `${API_BASE_URL}/products/hang-san-xuat/`;
      data = hangSanXuatData;
      if (!data.TenHangSanXuat) {
        setErrorMessage('Vui lòng nhập tên hãng sản xuất');
        return;
      }
    } else if (type === 'thongSo') {
      url = `${API_BASE_URL}/products/thong-so/`;
      data = thongSoData;
      if (!data.TenThongSo) {
        setErrorMessage('Vui lòng nhập tên thông số');
        return;
      }
    } else if (type === 'product') {
      url = `${API_BASE_URL}/products/products/`;
      data = new FormData();
      data.append('name', productData.name);
      data.append('description', productData.description);
      data.append('price', productData.price);
      data.append('stock', productData.stock);
      if (productData.category) data.append('category', productData.category);
      if (productData.hang_san_xuat) data.append('hang_san_xuat', productData.hang_san_xuat);
      if (productData.thong_so) data.append('thong_so', productData.thong_so);
      if (productData.khuyen_mai) data.append('khuyen_mai', productData.khuyen_mai);
      if (productData.image) data.append('image', productData.image);
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (!data.get('name') || !data.get('description') || !data.get('price') || !data.get('stock')) {
        setErrorMessage('Vui lòng nhập đầy đủ thông tin sản phẩm');
        return;
      }
    }

    try {
      const response = await axios.post(url, data, config);
      setSuccessMessage(`Thêm ${type} thành công!`);
      if (type === 'category') {
        setCategoryData({ name: '', description: '' });
        // Cập nhật lại danh sách danh mục
        const categoriesRes = await axios.get(`${API_BASE_URL}/products/categories/`);
        setCategories(categoriesRes.data);
      } else if (type === 'hangSanXuat') {
        setHangSanXuatData({ TenHangSanXuat: '' });
        // Cập nhật lại danh sách hãng sản xuất
        const hangSanXuatsRes = await axios.get(`${API_BASE_URL}/products/hang-san-xuat/`);
        setHangSanXuats(hangSanXuatsRes.data);
      } else if (type === 'thongSo') {
        setThongSoData({ TenThongSo: '' });
        // Cập nhật lại danh sách thông số
        const thongSosRes = await axios.get(`${API_BASE_URL}/products/thong-so/`);
        setThongSos(thongSosRes.data);
      } else if (type === 'product') {
        setProductData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          hang_san_xuat: '',
          thong_so: '',
          khuyen_mai: '',
          image: null,
        });
      }
    } catch (error) {
      setErrorMessage(
        `Thêm ${type} thất bại: ` + 
        (error.response?.data?.detail || 'Lỗi không xác định')
      );
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'category':
        return (
          <div className="form-card">
            <h2>
              <Folder className="form-icon" />
              Thêm Danh Mục
            </h2>
            <form onSubmit={(e) => handleSubmit('category', e)}>
              <div className="form-group">
                <label>Tên Danh Mục</label>
                <input
                  type="text"
                  value={categoryData.name}
                  onChange={handleInputChange('category', 'name')}
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <input
                  type="text"
                  value={categoryData.description}
                  onChange={handleInputChange('category', 'description')}
                  placeholder="Nhập mô tả danh mục"
                />
              </div>
              <button type="submit" className="btn btn-category">Thêm Danh Mục</button>
            </form>
          </div>
        );
      case 'hangSanXuat':
        return (
          <div className="form-card">
            <h2>
              <Factory className="form-icon" />
              Thêm Hãng Sản Xuất
            </h2>
            <form onSubmit={(e) => handleSubmit('hangSanXuat', e)}>
              <div className="form-group">
                <label>Tên Hãng Sản Xuất</label>
                <input
                  type="text"
                  value={hangSanXuatData.TenHangSanXuat}
                  onChange={handleInputChange('hangSanXuat', 'TenHangSanXuat')}
                  placeholder="Nhập tên hãng sản xuất"
                />
              </div>
              <button type="submit" className="btn btn-hangSanXuat">Thêm Hãng Sản Xuất</button>
            </form>
          </div>
        );
      case 'thongSo':
        return (
          <div className="form-card">
            <h2>
              <Settings2 className="form-icon" />
              Thêm Thông Số
            </h2>
            <form onSubmit={(e) => handleSubmit('thongSo', e)}>
              <div className="form-group">
                <label>Tên Thông Số</label>
                <input
                  type="text"
                  value={thongSoData.TenThongSo}
                  onChange={handleInputChange('thongSo', 'TenThongSo')}
                  placeholder="Nhập tên thông số"
                />
              </div>
              <button type="submit" className="btn btn-thongSo">Thêm Thông Số</button>
            </form>
          </div>
        );
      case 'product':
        return (
          <div className="form-card form-card-product">
            <h2>
              <PlusCircle className="form-icon" />
              Thêm Sản Phẩm
            </h2>
            <form onSubmit={(e) => handleSubmit('product', e)} className="form-columns">
              {/* Cột 1 */}
              <div className="form-column">
                <div className="form-group">
                  <label>Tên Sản Phẩm</label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={handleInputChange('product', 'name')}
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                <div className="form-group">
                  <label>Mô Tả</label>
                  <input
                    type="text"
                    value={productData.description}
                    onChange={handleInputChange('product', 'description')}
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>
                <div className="form-group">
                  <label>Giá</label>
                  <input
                    type="number"
                    value={productData.price}
                    onChange={handleInputChange('product', 'price')}
                    placeholder="Nhập giá sản phẩm"
                  />
                </div>
                <div className="form-group">
                  <label>Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    value={productData.stock}
                    onChange={handleInputChange('product', 'stock')}
                    placeholder="Nhập số lượng tồn kho"
                  />
                </div>
              </div>
              {/* Cột 2 */}
              <div className="form-column">
                <div className="form-group">
                  <label>Danh Mục</label>
                  <select
                    value={productData.category}
                    onChange={handleInputChange('product', 'category')}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hãng Sản Xuất</label>
                  <select
                    value={productData.hang_san_xuat}
                    onChange={handleInputChange('product', 'hang_san_xuat')}
                  >
                    <option value="">Chọn hãng sản xuất</option>
                    {hangSanXuats.map((hang) => (
                      <option key={hang.id} value={hang.id}>
                        {hang.TenHangSanXuat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Thông Số</label>
                  <select
                    value={productData.thong_so}
                    onChange={handleInputChange('product', 'thong_so')}
                  >
                    <option value="">Chọn thông số</option>
                    {thongSos.map((thongSo) => (
                      <option key={thongSo.id} value={thongSo.id}>
                        {thongSo.TenThongSo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Khuyến Mãi</label>
                  <select
                    value={productData.khuyen_mai}
                    onChange={handleInputChange('product', 'khuyen_mai')}
                  >
                    <option value="">Chọn khuyến mãi (nếu có)</option>
                    {khuyenMais.map((khuyenMai) => (
                      <option key={khuyenMai.id} value={khuyenMai.id}>
                        {khuyenMai.TenKhuyenMai}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hình Ảnh</label>
                  <input
                    type="file"
                    onChange={handleInputChange('product', 'image')}
                    accept="image/*"
                  />
                </div>
              </div>
              {/* Button nằm ở dưới cùng, full width */}
              <button type="submit" className="btn btn-product">Thêm Sản Phẩm</button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="staff-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Nhân Viên Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <SidebarItem icon={Package} label="Xử Lý Sản Phẩm" section="products" />
          <div className="sidebar-subitem">
            <SidebarItem icon={Folder} label="Thêm Danh Mục" section="category" />
            <SidebarItem icon={Factory} label="Thêm Hãng Sản Xuất" section="hangSanXuat" />
            <SidebarItem icon={Settings2} label="Thêm Thông Số" section="thongSo" />
            <SidebarItem icon={PlusCircle} label="Thêm Sản Phẩm" section="product" />
          </div>
          <div className="sidebar-divider"></div>
          <SidebarItem 
            icon={LogOut} 
            label="Đăng Xuất" 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }} 
          />
        </nav>
      </div>

      {/* Content Area */}
      <div className="content">
        <h1>Xử Lý Sản Phẩm</h1>
        {renderContent()}
        {/* Thông báo */}
        {errorMessage && (
          <div className="alert alert-error">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;