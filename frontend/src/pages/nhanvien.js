import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import './style/nhanvien.css';
import { API_BASE_URL } from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const StaffDashboard = () => {
  const [activeSection, setActiveSection] = useState('category');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'form'

  // State for data lists
  const [categories, setCategories] = useState([]);
  const [hangSanXuats, setHangSanXuats] = useState([]);
  const [thongSos, setThongSos] = useState([]);
  const [products, setProducts] = useState([]);

  // State for form data
  const [categoryData, setCategoryData] = useState({ TenDanhMuc: '', MoTa: '' });
  const [hangSanXuatData, setHangSanXuatData] = useState({ TenHangSanXuat: '' });
  const [thongSoData, setThongSoData] = useState({ TenThongSo: '' });
  const [productData, setProductData] = useState({
    TenSanPham: '',
    MoTa: '',
    GiaBan: '',
    SoLuongTon: '',
    DanhMuc: '',
    HangSanXuat: '',
    ThongSo: [],
    HinhAnh: null,
    selectedThongSo: '',
    thongSoValue: ''
  });

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // State for messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState('');
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState('');

  // Fetch data from API when component mounts or when active section changes
  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      switch (activeSection) {
        case 'category':
          const categoriesRes = await axios.get(`${API_BASE_URL}/products/danh-muc/`);
          setCategories(categoriesRes.data);
          break;
        case 'hangSanXuat':
          const hangSanXuatsRes = await axios.get(`${API_BASE_URL}/products/hang-san-xuat/`);
          setHangSanXuats(hangSanXuatsRes.data);
          break;
        case 'thongSo':
          const thongSosRes = await axios.get(`${API_BASE_URL}/products/thong-so/`);
          setThongSos(thongSosRes.data);
          break;
        case 'product':
          // Fetch all needed data for products
          const [productsRes, categoriesForProductRes, hangSanXuatsForProductRes, thongSosForProductRes] = 
            await Promise.all([
              axios.get(`${API_BASE_URL}/products/san-pham/`),
              axios.get(`${API_BASE_URL}/products/danh-muc/`),
              axios.get(`${API_BASE_URL}/products/hang-san-xuat/`),
              axios.get(`${API_BASE_URL}/products/thong-so/`)
            ]);
          setProducts(productsRes.data);
          setCategories(categoriesForProductRes.data);
          setHangSanXuats(hangSanXuatsForProductRes.data);
          setThongSos(thongSosForProductRes.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      setErrorMessage('Không thể lấy dữ liệu từ API');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    switch (activeSection) {
      case 'category':
        setCategoryData({ TenDanhMuc: '', MoTa: '' });
        break;
      case 'hangSanXuat':
        setHangSanXuatData({ TenHangSanXuat: '' });
        break;
      case 'thongSo':
        setThongSoData({ TenThongSo: '' });
        break;
      case 'product':
        setProductData({
          TenSanPham: '',
          MoTa: '',
          GiaBan: '',
          SoLuongTon: '',
          DanhMuc: '',
          HangSanXuat: '',
          ThongSo: [],
          HinhAnh: null,
          selectedThongSo: '',
          thongSoValue: ''
        });
        break;
      default:
        break;
    }
    setIsEditing(false);
    setEditId(null);
  };

  const SidebarItem = ({ icon: Icon, label, section }) => (
    <div 
      className={`sidebar-item ${activeSection === section ? 'active' : ''}`} 
      onClick={() => {
        setActiveSection(section);
        setViewMode('grid');
        resetForm();
        setErrorMessage('');
        setSuccessMessage('');
        setSearchTerm('');
      }}
    >
      <Icon className="sidebar-icon" />
      <span>{label}</span>
    </div>
  );

  const handleInputChange = (type, field) => (e) => {
    setErrorMessage('');
    if (type === 'category') {
      setCategoryData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === 'hangSanXuat') {
      setHangSanXuatData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === 'thongSo') {
      setThongSoData((prev) => ({ ...prev, [field]: e.target.value }));
    } else if (type === 'product') {
      if (field === 'HinhAnh') {
        setProductData((prev) => ({ ...prev, [field]: e.target.files[0] }));
      } else {
        setProductData((prev) => ({ ...prev, [field]: e.target.value }));
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = () => {
    switch (activeSection) {
      case 'category':
        return categories.filter(item => 
          item.TenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.MoTa && item.MoTa.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      case 'hangSanXuat':
        return hangSanXuats.filter(item => 
          item.TenHangSanXuat.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'thongSo':
        return thongSos.filter(item => 
          item.TenThongSo.toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'product':
        return products.filter(item => 
          item.TenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.MoTa && item.MoTa.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.TenDanhMuc && item.TenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.TenHangSanXuat && item.TenHangSanXuat.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      default:
        return [];
    }
  };

  const handleEdit = (type, id) => {
    setIsEditing(true);
    setEditId(id);
    setViewMode('form');
    
    switch (type) {
      case 'category':
        const category = categories.find(c => c.id === id);
        if (category) {
          setCategoryData({
            TenDanhMuc: category.TenDanhMuc,
            MoTa: category.MoTa || ''
          });
        }
        break;
      case 'hangSanXuat':
        const hangSanXuat = hangSanXuats.find(h => h.id === id);
        if (hangSanXuat) {
          setHangSanXuatData({
            TenHangSanXuat: hangSanXuat.TenHangSanXuat
          });
        }
        break;
      case 'thongSo':
        const thongSo = thongSos.find(t => t.id === id);
        if (thongSo) {
          setThongSoData({
            TenThongSo: thongSo.TenThongSo
          });
        }
        break;
      case 'product':
        const product = products.find(p => p.id === id);
        if (product) {
          setProductData({
            TenSanPham: product.TenSanPham,
            MoTa: product.MoTa || '',
            GiaBan: product.GiaBan,
            SoLuongTon: product.SoLuongTon,
            DanhMuc: product.DanhMuc || '',
            HangSanXuat: product.HangSanXuat || '',
            ThongSo: product.ChiTietThongSo || [],
            HinhAnh: null, // Cannot prefill file input
            selectedThongSo: '',
            thongSoValue: ''
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
    setErrorMessage('');
    setSuccessMessage('');
    
    let url = '';
    let successMessage = '';
    let errorMessage = '';
    
    switch (deleteItemType) {
      case 'category':
        url = `${API_BASE_URL}/products/danh-muc/${deleteItemId}/`;
        successMessage = 'Xóa danh mục thành công!';
        errorMessage = 'Xóa danh mục thất bại';
        break;
      case 'hangSanXuat':
        url = `${API_BASE_URL}/products/hang-san-xuat/${deleteItemId}/`;
        successMessage = 'Xóa hãng sản xuất thành công!';
        errorMessage = 'Xóa hãng sản xuất thất bại';
        break;
      case 'thongSo':
        url = `${API_BASE_URL}/products/thong-so/${deleteItemId}/`;
        successMessage = 'Xóa thông số thành công!';
        errorMessage = 'Xóa thông số thất bại';
        break;
      case 'product':
        url = `${API_BASE_URL}/products/san-pham/${deleteItemId}/`;
        successMessage = 'Xóa sản phẩm thành công!';
        errorMessage = 'Xóa sản phẩm thất bại';
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
        (error.response?.data?.detail || 'Có thể mục này đang được sử dụng ở nơi khác')
      );
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (type, e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    let url = '';
    let data = {};
    let config = {};

    if (type === 'category') {
      url = `${API_BASE_URL}/products/danh-muc/`;
      if (isEditing) url += `${editId}/`;
      data = categoryData;
      if (!data.TenDanhMuc) {
        setErrorMessage('Vui lòng nhập tên danh mục');
        setIsLoading(false);
        return;
      }
    } else if (type === 'hangSanXuat') {
      url = `${API_BASE_URL}/products/hang-san-xuat/`;
      if (isEditing) url += `${editId}/`;
      data = hangSanXuatData;
      if (!data.TenHangSanXuat) {
        setErrorMessage('Vui lòng nhập tên hãng sản xuất');
        setIsLoading(false);
        return;
      }
    } else if (type === 'thongSo') {
      url = `${API_BASE_URL}/products/thong-so/`;
      if (isEditing) url += `${editId}/`;
      data = thongSoData;
      if (!data.TenThongSo) {
        setErrorMessage('Vui lòng nhập tên thông số');
        setIsLoading(false);
        return;
      }
    } else if (type === 'product') {
      url = `${API_BASE_URL}/products/san-pham/`;
      if (isEditing) url += `${editId}/`;
      data = new FormData();
      data.append('TenSanPham', productData.TenSanPham);
      data.append('MoTa', productData.MoTa);
      data.append('GiaBan', productData.GiaBan);
      data.append('SoLuongTon', productData.SoLuongTon);
      if (productData.DanhMuc) data.append('DanhMuc', productData.DanhMuc);
      if (productData.HangSanXuat) data.append('HangSanXuat', productData.HangSanXuat);
      
      // Thông số kỹ thuật
      if (productData.ThongSo && productData.ThongSo.length > 0) {
        data.append('ChiTietThongSo', JSON.stringify(productData.ThongSo));
      }
      
      if (productData.HinhAnh) data.append('HinhAnh', productData.HinhAnh);
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
      
      if (!data.get('TenSanPham') || !data.get('MoTa') || !data.get('GiaBan') || !data.get('SoLuongTon')) {
        setErrorMessage('Vui lòng nhập đầy đủ thông tin sản phẩm');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isEditing) {
        await axios.put(url, data, config);
        setSuccessMessage(`Cập nhật ${type} thành công!`);
      } else {
        await axios.post(url, data, config);
        setSuccessMessage(`Thêm ${type} thành công!`);
      }
      
      resetForm();
      fetchData();
      setViewMode('grid');
    } catch (error) {
      setErrorMessage(
        `${isEditing ? 'Cập nhật' : 'Thêm'} ${type} thất bại: ` + 
        (error.response?.data?.detail || 'Lỗi không xác định')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderGridView = () => {
    const items = filteredData();
    
    switch (activeSection) {
      case 'category':
        return (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-search">
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
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
                  setViewMode('form');
                }}
              >
                <PlusCircle size={16} />
                Thêm Danh Mục
              </button>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Danh Mục</th>
                    <th>Mô Tả</th>
                    <th>Ngày Tạo</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.TenDanhMuc}</td>
                        <td>{item.MoTa}</td>
                        <td>{new Date(item.NgayTao).toLocaleDateString('vi-VN')}</td>
                        <td className="action-buttons">
                          <button 
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit('category', item.id)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-icon btn-delete"
                            onClick={() => confirmDelete('category', item.id, item.TenDanhMuc)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'hangSanXuat':
        return (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-search">
                <input
                  type="text"
                  placeholder="Tìm kiếm hãng sản xuất..."
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
                  setViewMode('form');
                }}
              >
                <PlusCircle size={16} />
                Thêm Hãng Sản Xuất
              </button>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Hãng Sản Xuất</th>
                    <th>Hành Động</th>
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
                            onClick={() => handleEdit('hangSanXuat', item.id)}
                            aria-label="Sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-icon btn-delete"
                            onClick={() => confirmDelete('hangSanXuat', item.id, item.TenHangSanXuat)}
                            aria-label="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'thongSo':
        return (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-search">
                <input
                  type="text"
                  placeholder="Tìm kiếm thông số..."
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
                  setViewMode('form');
                }}
              >
                <PlusCircle size={16} />
                Thêm Thông Số
              </button>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Thông Số</th>
                    <th>Hành Động</th>
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
                            onClick={() => handleEdit('thongSo', item.id)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-icon btn-delete"
                            onClick={() => confirmDelete('thongSo', item.id, item.TenThongSo)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'product':
        return (
          <div className="grid-container">
            <div className="grid-header">
              <div className="grid-search">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
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
                  setViewMode('form');
                }}
              >
                <PlusCircle size={16} />
                Thêm Sản Phẩm
              </button>
            </div>
            <div className="grid-table-wrapper">
              <table className="grid-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hình Ảnh</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Giá Bán</th>
                    <th>Tồn Kho</th>
                    <th>Danh Mục</th>
                    <th>Hãng SX</th>
                    <th>Hành Động</th>
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
                            <div className="no-image">No Image</div>
                          )}
                        </td>
                        <td>{item.TenSanPham}</td>
                        <td>{parseInt(item.GiaBan).toLocaleString('vi-VN')} đ</td>
                        <td>{item.SoLuongTon}</td>
                        <td>{item.TenDanhMuc || 'N/A'}</td>
                        <td>{item.TenHangSanXuat || 'N/A'}</td>
                        <td className="action-buttons">
                          <button 
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit('product', item.id)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-icon btn-delete"
                            onClick={() => confirmDelete('product', item.id, item.TenSanPham)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">Không có dữ liệu</td>
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
      case 'category':
        return (
          <div className="form-card">
            <div className="form-header">
              <h2>
                <Folder className="form-icon" />
                {isEditing ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
              </h2>
              <button 
                className="btn-back"
                onClick={() => {
                  resetForm();
                  setViewMode('grid');
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit('category', e)}>
              <div className="form-group">
                <label>Tên Danh Mục</label>
                <input
                  type="text"
                  value={categoryData.TenDanhMuc}
                  onChange={handleInputChange('category', 'TenDanhMuc')}
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <textarea
                  value={categoryData.MoTa}
                  onChange={handleInputChange('category', 'MoTa')}
                  placeholder="Nhập mô tả danh mục"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={() => {
                    resetForm();
                    setViewMode('grid');
                  }}
                >
                  Hủy
                </button>

                <button 
                  type="submit" 
                  className="btn btn-category"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="spinner" size={16} />
                  ) : (
                    <>
                      {isEditing ? 'Cập Nhật' : 'Thêm'} Danh Mục
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );
        
      case 'thongSo':
        return (
          <div className="form-card">
            <div className="form-header">
              <h2>
                <Settings2 className="form-icon" />
                {isEditing ? 'Sửa Thông Số' : 'Thêm Thông Số'}
              </h2>
              <button 
                className="btn-back"
                onClick={() => {
                  resetForm();
                  setViewMode('grid');
                }}
              >
                <X size={18} />
              </button>
            </div>
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
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={() => {
                    resetForm();
                    setViewMode('grid');
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-thongSo"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="spinner" size={16} />
                  ) : (
                    <>
                      {isEditing ? 'Cập Nhật' : 'Thêm'} Thông Số
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

        case 'hangSanXuat':
          return (
            <div className="form-card">
              <div className="form-header">
                <h2>
                  <Factory className="form-icon" />
                  {isEditing ? 'Sửa Hãng Sản Xuất' : 'Thêm Hãng Sản Xuất'}
                </h2>
                <button 
                  className="btn-back"
                  onClick={() => {
                    resetForm();
                    setViewMode('grid');
                  }}
                >
                  <X size={18} />
                </button>
              </div>
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
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-cancel"
                    onClick={() => {
                      resetForm();
                      setViewMode('grid');
                    }}
                  >
                    Hủy
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
                        {isEditing ? 'Cập Nhật' : 'Thêm'} Hãng Sản Xuất
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          );
      
      case 'product':
        return (
          <div className="form-card form-card-product">
            <div className="form-header">
              <h2>
                <PlusCircle className="form-icon" />
                {isEditing ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}
              </h2>
              <button 
                className="btn-back"
                onClick={() => {
                  resetForm();
                  setViewMode('grid');
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => handleSubmit('product', e)} className="form-columns">
              {/* Cột 1 */}
              <div className="form-column">
                <div className="form-group">
                  <label>Tên Sản Phẩm</label>
                  <input
                    type="text"
                    value={productData.TenSanPham}
                    onChange={handleInputChange('product', 'TenSanPham')}
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                <div className="form-group">
                  <label>Mô Tả</label>
                  <textarea
                    value={productData.MoTa}
                    onChange={handleInputChange('product', 'MoTa')}
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>
                <div className="form-group">
                  <label>Giá Bán</label>
                  <input
                    type="number"
                    value={productData.GiaBan}
                    onChange={handleInputChange('product', 'GiaBan')}
                    placeholder="Nhập giá sản phẩm"
                  />
                </div>
                <div className="form-group">
                  <label>Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    value={productData.SoLuongTon}
                    onChange={handleInputChange('product', 'SoLuongTon')}
                    placeholder="Nhập số lượng tồn kho"
                  />
                </div>
              </div>
              {/* Cột 2 */}
              <div className="form-column">
                <div className="form-group">
                  <label>Danh Mục</label>
                  <select
                    value={productData.DanhMuc}
                    onChange={handleInputChange('product', 'DanhMuc')}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.TenDanhMuc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Hãng Sản Xuất</label>
                  <select
                    value={productData.HangSanXuat}
                    onChange={handleInputChange('product', 'HangSanXuat')}
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
                    value={productData.selectedThongSo || ""}
                    onChange={(e) => {
                      const thongSoId = e.target.value;
                      if (thongSoId) {
                        // Hiển thị form nhập giá trị cho thông số
                        setProductData(prev => ({
                          ...prev,
                          selectedThongSo: thongSoId
                        }));
                      }
                    }}
                  >
                    <option value="">Chọn thông số</option>
                    {thongSos.map((thongSo) => (
                      <option key={thongSo.id} value={thongSo.id}>
                        {thongSo.TenThongSo}
                      </option>
                    ))}
                  </select>
                </div>
                {productData.selectedThongSo && (
                  <div className="form-group">
                    <label>Giá Trị Thông Số</label>
                    <div className="thong-so-value-container">
                      <input
                        type="text"
                        placeholder="Nhập giá trị thông số"
                        value={productData.thongSoValue || ""}
                        onChange={(e) => setProductData(prev => ({
                          ...prev,
                          thongSoValue: e.target.value
                        }))}
                      />
                      <button
                        type="button"
                        className="btn btn-add-thong-so"
                        onClick={() => {
                          if (productData.selectedThongSo && productData.thongSoValue) {
                            const newThongSo = {
                              ThongSo: productData.selectedThongSo,
                              GiaTriThongSo: productData.thongSoValue
                            };
                            setProductData(prev => ({
                              ...prev,
                              ThongSo: [...prev.ThongSo, newThongSo],
                              selectedThongSo: "",
                              thongSoValue: ""
                            }));
                          }
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                )}
                
                {productData.ThongSo && productData.ThongSo.length > 0 && (
                  <div className="form-group">
                    <label>Thông Số Đã Thêm</label>
                    <div className="thong-so-list">
                      {productData.ThongSo.map((ts, index) => {
                        const thongSoInfo = thongSos.find(t => t.id === parseInt(ts.ThongSo));
                        return (
                          <div key={index} className="thong-so-item">
                            {thongSoInfo?.TenThongSo}: {ts.GiaTriThongSo}
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => {
                                setProductData(prev => ({
                                  ...prev,
                                  ThongSo: prev.ThongSo.filter((_, i) => i !== index)
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
                  <label>Hình Ảnh</label>
                  <input
                    type="file"
                    onChange={handleInputChange('product', 'HinhAnh')}
                    accept="image/*"
                  />
                  {isEditing && (
                    <div className="file-note">
                      Để trống nếu không muốn thay đổi hình ảnh
                    </div>
                  )}
                </div>
              </div>
              {/* Button nằm ở dưới cùng, full width */}
              <div className="form-actions full-width">
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={() => {
                    resetForm();
                    setViewMode('grid');
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-product"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="spinner" size={16} />
                  ) : (
                    <>
                      {isEditing ? 'Cập Nhật' : 'Thêm'} Sản Phẩm
                    </>
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
    return viewMode === 'grid' ? renderGridView() : renderFormView();
  };

  // Delete confirmation modal
  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <AlertCircle className="modal-icon" />
            <h3>Xác nhận xóa</h3>
            <button 
              className="btn-close"
              onClick={() => setShowDeleteModal(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="modal-body">
            <p>Bạn có chắc chắn muốn xóa <strong>{deleteItemName}</strong>?</p>
            <p className="warning-text">Hành động này không thể hoàn tác!</p>
          </div>
          <div className="modal-footer">
            <button 
              className="btn btn-cancel"
              onClick={() => setShowDeleteModal(false)}
            >
              Hủy
            </button>
            <button 
              className="btn btn-confirm-delete"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="spinner" size={16} />
              ) : (
                'Xóa'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="staff-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Nhân Viên Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          {/* Thay thế SidebarItem bằng div có kiểu dáng tương tự */}
          <div className="sidebar-category">
            <Package className="sidebar-icon" />
            <span>Xử Lý Sản Phẩm</span>
          </div>
          <div className="sidebar-subitem">
            <SidebarItem icon={Folder} label="Danh Mục" section="category" />
            <SidebarItem icon={Factory} label="Hãng Sản Xuất" section="hangSanXuat" />
            <SidebarItem icon={Settings2} label="Thông Số" section="thongSo" />
            <SidebarItem icon={PlusCircle} label="Sản Phẩm" section="product" />
          </div>
          <div className="sidebar-divider"></div>
          <div 
            className="sidebar-item"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            <LogOut className="sidebar-icon" />
            <span>Đăng Xuất</span>
          </div>
        </nav>
      </div>

      {/* Content Area */}
      <div className="content">
        <h1>
          {activeSection === 'category' && 'Quản Lý Danh Mục'}
          {activeSection === 'hangSanXuat' && 'Quản Lý Hãng Sản Xuất'}
          {activeSection === 'thongSo' && 'Quản Lý Thông Số'}
          {activeSection === 'product' && 'Quản Lý Sản Phẩm'}
        </h1>
        {renderContent()}
        
        {/* Thông báo */}
        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            {errorMessage}
            <button 
              className="btn-close-alert"
              onClick={() => setErrorMessage('')}
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
              onClick={() => setSuccessMessage('')}
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Modal */}
        {renderDeleteModal()}
      </div>
    </div>
  );
};

export default StaffDashboard;