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
    username: '',
    email: '',
    password: '',
    vaitro: 'khach'
  });
  const [activeTab, setActiveTab] = useState('overview'); // Quản lý tab hiện tại

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
      }
    } catch (error) {
      setError('Không thể tải danh sách người dùng');
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
        setSuccess('Thêm người dùng thành công');
        setNewUser({ username: '', email: '', password: '', vaitro: 'khach' });
        fetchUsers();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Thêm người dùng thất bại');
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
          setUsers(users.filter(user => user.id !== userId));
          setTotalUsers(totalUsers - 1);
          setSuccess('Xóa người dùng thành công');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Xóa người dùng thất bại');
      }
    }
  };

  const handleEdit = (user) => {
    setEditUser({ ...user, matkhau: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const updateData = {
        email: editUser.email,
        vaitro: editUser.vaitro,
        ...(editUser.matkhau && { matkhau: editUser.matkhau })
      };
      const response = await axios.put(
        `${API_BASE_URL}/auth/users/update/${editUser.id}/`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'ok') {
        setUsers(users.map(u => u.id === editUser.id ? response.data.user : u));
        setEditUser(null);
        setSuccess('Cập nhật người dùng thành công');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Cập nhật người dùng thất bại');
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
                  <label>Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Nhập username"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="form-group">
                  <label>Mật Khẩu</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                <div className="form-group">
                  <label>Vai Trò</label>
                  <select
                    value={newUser.vaitro}
                    onChange={(e) => setNewUser({ ...newUser, vaitro: e.target.value })}
                  >
                    <option value="khach">Khách</option>
                    <option value="nhanvien">Nhân Viên</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit"><UserPlus size={16} /> Thêm</button>
              </form>
            </div>

            {/* Danh sách người dùng */}
            <div className="user-management">
              <h2>Quản Lý Người Dùng</h2>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Vai Trò</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.vaitro}</td>
                      <td>
                        <button onClick={() => handleEdit(user)}>Sửa</button>
                        <button onClick={() => handleDelete(user.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <th>Username</th>
                  <th>Email</th>
                  <th>Vai Trò</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.vaitro}</td>
                    <td>
                      <button onClick={() => handleEdit(user)}>Sửa</button>
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
                    <label>Username</label>
                    <input type="text" value={editUser.username} disabled />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật Khẩu Mới</label>
                    <input
                      type="password"
                      value={editUser.matkhau || ''}
                      onChange={(e) => setEditUser({ ...editUser, matkhau: e.target.value })}
                      placeholder="Nhập mật khẩu mới (nếu muốn đổi)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Vai Trò</label>
                    <select
                      value={editUser.vaitro}
                      onChange={(e) => setEditUser({ ...editUser, vaitro: e.target.value })}
                    >
                      <option value="khach">Khách</option>
                      <option value="nhanvien">Nhân Viên</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button type="submit">Cập Nhật</button>
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
                  <th>Username</th>
                  <th>Email</th>
                  <th>Vai Trò</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.vaitro}</td>
                    <td>
                      <button onClick={() => handleDelete(user.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Thông báo */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;