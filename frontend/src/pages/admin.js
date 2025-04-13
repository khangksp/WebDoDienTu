import React, { useState, useEffect } from 'react';
import { BarChart3, LogOut, UserPlus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import './style/dashboard.css';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({
    tendangnhap: '',
    password: '',
    loaiquyen: 'khach',
    nguoidung: {
      tennguoidung: '',
      email: '',
      sodienthoai: '',
      diachi: ''
    }
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/auth/users/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'ok') {
        setUsers(response.data.users);
        setTotalUsers(response.data.users.length);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'ok') {
        setSuccess(response.data.message);
        setNewUser({
          tendangnhap: '',
          password: '',
          loaiquyen: 'khach',
          nguoidung: {
            tennguoidung: '',
            email: '',
            sodienthoai: '',
            diachi: ''
          }
        });
        fetchUsers();
        setError('');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Thêm người dùng thất bại';
      const errorDetails = err.response?.data?.errors || {};
      let detailedError = errorMessage;
      if (errorDetails.tendangnhap) {
        detailedError += `: Tên đăng nhập ${errorDetails.tendangnhap.join(', ')}`;
      }
      if (errorDetails.nguoidung) {
        const nguoidungErrors = errorDetails.nguoidung[0] || {};
        if (nguoidungErrors.email) {
          detailedError += `: Email ${nguoidungErrors.email.join(', ')}`;
        }
        if (nguoidungErrors.sodienthoai) {
          detailedError += `: Số điện thoại ${nguoidungErrors.sodienthoai.join(', ')}`;
        }
      }
      if (errorDetails.password) {
        detailedError += `: Mật khẩu ${errorDetails.password.join(', ')}`;
      }
      setError(detailedError);
      setSuccess('');
    }
  };

  const handleEdit = (user) => {
    setEditUser({
      mataikhoan: user.mataikhoan,
      tendangnhap: user.tendangnhap,
      loaiquyen: user.loaiquyen,
      nguoidung: {
        tennguoidung: user.nguoidung_data.tennguoidung || '',
        email: user.nguoidung_data.email || '',
        sodienthoai: user.nguoidung_data.sodienthoai || '',
        diachi: user.nguoidung_data.diachi || ''
      },
      matkhau: ''
    });
    setActiveTab('edit');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const updateData = {
        loaiquyen: editUser.loaiquyen,
        matkhau: editUser.matkhau || undefined,
        nguoidung: {
          tennguoidung: editUser.nguoidung.tennguoidung,
          email: editUser.nguoidung.email,
          sodienthoai: editUser.nguoidung.sodienthoai,
          diachi: editUser.nguoidung.diachi
        }
      };
      const response = await axios.put(
        `${API_BASE_URL}/auth/users/update/${editUser.mataikhoan}/`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'ok') {
        setSuccess(response.data.message);
        fetchUsers();
        setEditUser(null);
        setError('');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Cập nhật người dùng thất bại';
      const errorDetails = err.response?.data?.errors || {};
      let detailedError = errorMessage;
      if (errorDetails.nguoidung) {
        const nguoidungErrors = errorDetails.nguoidung[0] || {};
        if (nguoidungErrors.email) {
          detailedError += `: Email ${nguoidungErrors.email.join(', ')}`;
        }
        if (nguoidungErrors.sodienthoai) {
          detailedError += `: Số điện thoại ${nguoidungErrors.sodienthoai.join(', ')}`;
        }
      }
      if (errorDetails.matkhau) {
        detailedError += `: Mật khẩu ${errorDetails.matkhau.join(', ')}`;
      }
      setError(detailedError);
      setSuccess('');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.delete(`${API_BASE_URL}/auth/users/delete/${userId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status === 'ok') {
          setSuccess(response.data.message);
          fetchUsers();
          setError('');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Xóa người dùng thất bại');
        setSuccess('');
      }
    }
  };

  const SidebarItem = ({ icon: Icon, label, tab }) => (
    <div
      className={`sidebar-item ${activeTab === tab ? 'active' : ''}`}
      onClick={() => setActiveTab(tab)}
    >
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
          <SidebarItem icon={BarChart3} label="Tổng Quan" tab="overview" />
          <SidebarItem icon={Edit} label="Sửa Người Dùng" tab="edit" />
          <SidebarItem icon={Trash2} label="Xóa Người Dùng" tab="delete" />
          <SidebarItem
            icon={LogOut}
            label="Đăng Xuất"
            tab="logout"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          />
        </nav>
      </div>

      {/* Content Area */}
      <div className="content">
        {/* Thông báo */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tab Tổng Quan */}
        {activeTab === 'overview' && (
          <>
            <h1>Tổng Quan</h1>
            <div className="stat-card">
              <h3>Tổng Người Dùng</h3>
              <p>{totalUsers}</p>
            </div>

            {/* Form thêm người dùng */}
            <div className="add-user-form">
              <h2>Thêm Người Dùng</h2>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label>Tên đăng nhập <span className="required">*</span></label>
                  <input
                    type="text"
                    value={newUser.tendangnhap}
                    onChange={(e) => setNewUser({ ...newUser, tendangnhap: e.target.value })}
                    placeholder="Nhập tên đăng nhập"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu <span className="required">*</span></label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Tên người dùng</label>
                  <input
                    type="text"
                    value={newUser.nguoidung.tennguoidung}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        nguoidung: { ...newUser.nguoidung, tennguoidung: e.target.value }
                      })
                    }
                    placeholder="Nhập tên người dùng"
                  />
                </div>
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={newUser.nguoidung.email}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        nguoidung: { ...newUser.nguoidung, email: e.target.value }
                      })
                    }
                    placeholder="Nhập email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={newUser.nguoidung.sodienthoai}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        nguoidung: { ...newUser.nguoidung, sodienthoai: e.target.value }
                      })
                    }
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={newUser.nguoidung.diachi}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        nguoidung: { ...newUser.nguoidung, diachi: e.target.value }
                      })
                    }
                    placeholder="Nhập địa chỉ"
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <select
                    value={newUser.loaiquyen}
                    onChange={(e) => setNewUser({ ...newUser, loaiquyen: e.target.value })}
                  >
                    <option value="khach">Khách</option>
                    <option value="nhanvien">Nhân viên</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit"><UserPlus size={16} /> Thêm</button>
              </form>
            </div>

            {/* Danh sách người dùng */}
            {/* <div className="user-management">
              <h2>Quản Lý Người Dùng</h2>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên đăng nhập</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.mataikhoan}>
                      <td>{user.mataikhoan}</td>
                      <td>{user.tendangnhap}</td>
                      <td>{user.nguoidung_data.email}</td>
                      <td>{user.loaiquyen}</td>
                      <td>
                        <button onClick={() => handleEdit(user)}><Edit size={16} /> Sửa</button>
                        <button onClick={() => handleDelete(user.mataikhoan)}><Trash2 size={16} /> Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}
          </>
        )}

        {/* Tab Sửa Người Dùng */}
        {activeTab === 'edit' && (
          <div className="user-management">
            <h1>Sửa Người Dùng</h1>
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.mataikhoan}>
                    <td>{user.mataikhoan}</td>
                    <td>{user.tendangnhap}</td>
                    <td>{user.nguoidung_data.email}</td>
                    <td>{user.loaiquyen}</td>
                    <td>
                      <button onClick={() => handleEdit(user)}><Edit size={16} /> Sửa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Form sửa người dùng */}
            {editUser && (
              <div className="edit-form">
                <h3>Sửa Người Dùng</h3>
                <form onSubmit={handleUpdate}>
                  <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input type="text" value={editUser.tendangnhap} disabled />
                  </div>
                  <div className="form-group">
                    <label>Tên người dùng</label>
                    <input
                      type="text"
                      value={editUser.nguoidung.tennguoidung}
                      onChange={(e) =>
                        setEditUser({
                          ...editUser,
                          nguoidung: { ...editUser.nguoidung, tennguoidung: e.target.value }
                        })
                      }
                      placeholder="Nhập tên người dùng"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      value={editUser.nguoidung.email}
                      onChange={(e) =>
                        setEditUser({
                          ...editUser,
                          nguoidung: { ...editUser.nguoidung, email: e.target.value }
                        })
                      }
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      value={editUser.nguoidung.sodienthoai}
                      onChange={(e) =>
                        setEditUser({
                          ...editUser,
                          nguoidung: { ...editUser.nguoidung, sodienthoai: e.target.value }
                        })
                      }
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      value={editUser.nguoidung.diachi}
                      onChange={(e) =>
                        setEditUser({
                          ...editUser,
                          nguoidung: { ...editUser.nguoidung, diachi: e.target.value }
                        })
                      }
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <input
                      type="password"
                      value={editUser.matkhau}
                      onChange={(e) => setEditUser({ ...editUser, matkhau: e.target.value })}
                      placeholder="Nhập mật khẩu mới (nếu muốn đổi)"
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vai trò</label>
                    <select
                      value={editUser.loaiquyen}
                      onChange={(e) => setEditUser({ ...editUser, loaiquyen: e.target.value })}
                    >
                      <option value="khach">Khách</option>
                      <option value="nhanvien">Nhân viên</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button type="submit">Cập nhật</button>
                  <button type="button" onClick={() => setEditUser(null)}>Hủy</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab Xóa Người Dùng */}
        {activeTab === 'delete' && (
          <div className="user-management">
            <h1>Xóa Người Dùng</h1>
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.mataikhoan}>
                    <td>{user.mataikhoan}</td>
                    <td>{user.tendangnhap}</td>
                    <td>{user.nguoidung_data.email}</td>
                    <td>{user.loaiquyen}</td>
                    <td>
                      <button onClick={() => handleDelete(user.mataikhoan)}><Trash2 size={16} /> Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;