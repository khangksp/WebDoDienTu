import React, { useState, useEffect } from 'react';
import { BarChart3, LogOut } from 'lucide-react';
import axios from 'axios';
import './style/dashboard.css'; // File CSS mới
import { API_BASE_URL } from '../config';
const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);

  // Lấy số lượng tài khoản khi component được mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/users/`)
        if (response.data.status === 'ok') {
          setTotalUsers(response.data.users.length);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const SidebarItem = ({ icon: Icon, label, onClick }) => (
    <div className="sidebar-item" onClick={onClick}>
      <Icon className="sidebar-icon" />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <SidebarItem icon={BarChart3} label="Tổng Quan" onClick={() => {}} />
          <div className="sidebar-divider"></div>
          <SidebarItem 
            icon={LogOut} 
            label="Đăng Xuất" 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }} 
          />
        </nav>
      </div>

      {/* Content Area */}
      <div className="content">
        <Dashboard totalUsers={totalUsers} />
      </div>
    </div>
  );
};

const Dashboard = ({ totalUsers }) => {
  const [khachData, setKhachData] = useState({
    username: '',
    email: '',
    password: '',
    vaitro: 'khach',
  });

  const [nhanvienData, setNhanvienData] = useState({
    username: '',
    email: '',
    password: '',
    vaitro: 'nhanvien',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (type, field) => (e) => {
    if (type === 'khach') {
      setKhachData((prev) => ({ ...prev, [field]: e.target.value }));
    } else {
      setNhanvienData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleRegister = async (type, e) => {
    e.preventDefault();
    const data = type === 'khach' ? khachData : nhanvienData;

    if (!data.username || !data.email || !data.password) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`,data)
      setSuccessMessage(`Tạo tài khoản ${type} thành công!`);
      setErrorMessage('');
      if (type === 'khach') {
        setKhachData({ username: '', email: '', password: '', vaitro: 'khach' });
      } else {
        setNhanvienData({ username: '', email: '', password: '', vaitro: 'nhanvien' });
      }
    } catch (error) {
      setErrorMessage(
        'Tạo tài khoản thất bại: ' + 
        (error.response?.data?.detail || 'Lỗi không xác định')
      );
      setSuccessMessage('');
    }
  };

  return (
    <div className="dashboard">
      <h1>Tổng Quan</h1>

      {/* Tổng Người Dùng */}
      <div className="stat-card">
        <h3>Tổng Người Dùng</h3>
        <p>{totalUsers}</p>
      </div>

      {/* Form Tạo Tài Khoản */}
      <div className="form-container">
        {/* Form Tạo Tài Khoản Khách */}
        <div className="form-card">
          <h2>Tạo Tài Khoản Khách</h2>
          <form onSubmit={(e) => handleRegister('khach', e)}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={khachData.username}
                onChange={handleInputChange('khach', 'username')}
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={khachData.email}
                onChange={handleInputChange('khach', 'email')}
                placeholder="Nhập email"
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={khachData.password}
                onChange={handleInputChange('khach', 'password')}
                placeholder="Nhập mật khẩu"
              />
            </div>
            <button type="submit" className="btn btn-khach">Tạo Tài Khoản Khách</button>
          </form>
        </div>

        {/* Form Tạo Tài Khoản Nhân Viên */}
        <div className="form-card">
          <h2>Tạo Tài Khoản Nhân Viên</h2>
          <form onSubmit={(e) => handleRegister('nhanvien', e)}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={nhanvienData.username}
                onChange={handleInputChange('nhanvien', 'username')}
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={nhanvienData.email}
                onChange={handleInputChange('nhanvien', 'email')}
                placeholder="Nhập email"
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={nhanvienData.password}
                onChange={handleInputChange('nhanvien', 'password')}
                placeholder="Nhập mật khẩu"
              />
            </div>
            <button type="submit" className="btn btn-nhanvien">Tạo Tài Khoản Nhân Viên</button>
          </form>
        </div>
      </div>

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
  );
};

export default AdminDashboard;