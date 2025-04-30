import React, { useState, useEffect } from 'react';
import { BarChart3, LogOut, UserPlus, Edit, Trash2, PieChart, MessageSquare, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './style/dashboard.css';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsSubTab, setAnalyticsSubTab] = useState('revenue');
  
  // States cho phần Feedback
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchAnalyticsData();
    fetchFeedbacks();
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

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/orders/list-orders/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.status === 'success') {
        setOrders(response.data.orders);
        setAnalyticsError('');
      }
    } catch (err) {
      setAnalyticsError(err.response?.data?.message || 'Không thể tải dữ liệu đơn hàng');
    }
  };

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const response = await axios.get('https://script.google.com/macros/s/AKfycbxUgifzVg7FO-8TEQh9HvkrMEbfqTj2jyxd7W9k2yw1r2F0ZQ6p444c7KEt3yz8cBwX/exec');
      if (response.data && response.data.status === 'success') {
        const feedbackData = response.data.feedbacks || [];
        setFeedbacks(feedbackData);
        setFeedbackCount(feedbackData.length);
        
        // Khởi tạo trạng thái phản hồi (mặc định: 'pending')
        const statusObj = {};
        feedbackData.forEach((item, index) => {
          statusObj[index] = 'pending';
        });
        setFeedbackStatus(statusObj);
        
        setFeedbackError('');
      } else {
        throw new Error(response.data?.message || 'Không thể tải danh sách phản hồi');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setFeedbackError('Không thể tải danh sách phản hồi: ' + (err.message || 'Lỗi không xác định'));
      // Sử dụng dữ liệu mẫu trong trường hợp API thất bại
      const mockData = [
        {
          name: 'Nguyễn Văn A',
          content: 'Tôi rất hài lòng với dịch vụ của shop, sản phẩm giao nhanh và đúng hẹn.',
          phone: '0987654321',
          email: 'nguyenvana@example.com',
          timestamp: '2025-04-28T08:30:00'
        },
        {
          name: 'Trần Thị B',
          content: 'Sản phẩm tốt nhưng giao hàng hơi lâu. Mong shop cải thiện dịch vụ giao hàng.',
          phone: '0912345678',
          email: 'tranthib@example.com',
          timestamp: '2025-04-27T15:45:00'
        },
        {
          name: 'Lê Văn C',
          content: 'Tôi có vấn đề với đơn hàng #12345, mong nhân viên liên hệ lại với tôi sớm.',
          phone: '0909123456',
          email: 'levanc@example.com',
          timestamp: '2025-04-26T10:15:00'
        }
      ];
      
      setFeedbacks(mockData);
      setFeedbackCount(mockData.length);
      
      // Khởi tạo trạng thái phản hồi (mặc định: 'pending')
      const statusObj = {};
      mockData.forEach((item, index) => {
        statusObj[index] = 'pending';
      });
      setFeedbackStatus(statusObj);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Thay đổi trạng thái feedback
  const updateFeedbackStatus = (id, status) => {
    setFeedbackStatus(prev => ({
      ...prev,
      [id]: status
    }));
    
    // Đây là nơi bạn có thể thêm code để cập nhật trạng thái trong database (nếu có)
    setSuccess(`Đã cập nhật trạng thái phản hồi #${id+1} thành ${status === 'pending' ? 'Chưa xử lý' : status === 'processing' ? 'Đang xử lý' : status === 'completed' ? 'Đã xử lý' : 'Bỏ qua'}`);
    setTimeout(() => setSuccess(''), 3000);
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

  const processAnalyticsData = () => {
    // Lọc đơn hàng theo ngày
    const filteredOrdersDelivered = orders.filter(order => {
      const orderDate = new Date(order.NgayDatHang);
      orderDate.setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      return (
        order.MaTrangThai === 5 &&
        (!start || orderDate >= start) &&
        (!end || orderDate <= end)
      );
    });

    const filteredOrdersCancelled = orders.filter(order => {
      const orderDate = new Date(order.NgayDatHang);
      orderDate.setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      return (
        order.MaTrangThai === 6 &&
        (!start || orderDate >= start) &&
        (!end || orderDate <= end)
      );
    });

    const filteredOrdersRefunded = orders.filter(order => {
      const orderDate = new Date(order.NgayDatHang);
      orderDate.setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      return (
        order.MaTrangThai === 7 &&
        (!start || orderDate >= start) &&
        (!end || orderDate <= end)
      );
    });

    // Tạo danh sách các ngày trong khoảng thời gian
    const dateRange = [];
    const defaultStart = orders.length > 0 
      ? new Date(Math.min(...orders.map(o => new Date(o.NgayDatHang)))) 
      : new Date();
    const defaultEnd = orders.length > 0 
      ? new Date(Math.max(...orders.map(o => new Date(o.NgayDatHang)))) 
      : new Date();
    
    const start = startDate ? new Date(startDate) : defaultStart;
    const end = endDate ? new Date(endDate) : defaultEnd;
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateRange.push(new Date(d).toLocaleDateString('vi-VN'));
    }

    // Tính doanh thu theo ngày (MaTrangThai = 5)
    const revenueByDate = dateRange.reduce((acc, date) => {
      const dailyRevenue = filteredOrdersDelivered
        .filter(order => new Date(order.NgayDatHang).toLocaleDateString('vi-VN') === date)
        .reduce((sum, order) => sum + parseFloat(order.TongTien || 0), 0);
      acc[date] = dailyRevenue;
      return acc;
    }, {});

    // Tính số lượng khách hàng theo ngày (MaTrangThai = 5)
    const customersByDate = dateRange.reduce((acc, date) => {
      const dailyCustomers = new Set(
        filteredOrdersDelivered
          .filter(order => new Date(order.NgayDatHang).toLocaleDateString('vi-VN') === date)
          .map(order => order.SoDienThoai)
      ).size;
      acc[date] = dailyCustomers;
      return acc;
    }, {});

    // Tính số lượng đơn bị hủy theo ngày (MaTrangThai = 6)
    const cancelledOrdersByDate = dateRange.reduce((acc, date) => {
      const dailyCancelled = filteredOrdersCancelled
        .filter(order => new Date(order.NgayDatHang).toLocaleDateString('vi-VN') === date)
        .length;
      acc[date] = dailyCancelled;
      return acc;
    }, {});

    // Tính tổng tiền hoàn theo ngày (MaTrangThai = 7)
    const refundedAmountByDate = dateRange.reduce((acc, date) => {
      const dailyRefunded = filteredOrdersRefunded
        .filter(order => new Date(order.NgayDatHang).toLocaleDateString('vi-VN') === date)
        .reduce((sum, order) => sum + parseFloat(order.TongTien || 0), 0);
      acc[date] = dailyRefunded;
      return acc;
    }, {});

    return {
      labels: dateRange,
      revenueData: dateRange.map(date => revenueByDate[date] || 0),
      customerData: dateRange.map(date => customersByDate[date] || 0),
      cancelledData: dateRange.map(date => cancelledOrdersByDate[date] || 0),
      refundedData: dateRange.map(date => refundedAmountByDate[date] || 0),
    };
  };

  const analyticsData = processAnalyticsData();

  const revenueChartData = {
    labels: analyticsData.labels,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: analyticsData.revenueData,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const customerChartData = {
    labels: analyticsData.labels,
    datasets: [
      {
        label: 'Số lượng khách hàng',
        data: analyticsData.customerData,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const cancelledChartData = {
    labels: analyticsData.labels,
    datasets: [
      {
        label: 'Số lượng đơn bị hủy',
        data: analyticsData.cancelledData,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const refundedChartData = {
    labels: analyticsData.labels,
    datasets: [
      {
        label: 'Tổng tiền hoàn (VNĐ)',
        data: analyticsData.refundedData,
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Ngày',
        },
      },
    },
  };

  const revenueChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Doanh thu theo ngày',
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)',
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('vi-VN') + ' đ';
          }
        }
      },
    },
  };

  const customerChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Số lượng khách hàng theo ngày',
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Số lượng khách hàng',
        },
      },
    },
  };

  const cancelledChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Số lượng đơn bị hủy theo ngày',
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Số lượng đơn bị hủy',
        },
      },
    },
  };

  const refundedChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Tổng tiền hoàn theo ngày',
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Tổng tiền hoàn (VNĐ)',
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('vi-VN') + ' đ';
          }
        }
      },
    },
  };

  const SidebarItem = ({ icon: Icon, label, tab, badge }) => (
    <div
      className={`sidebar-item ${activeTab === tab ? 'active' : ''}`}
      onClick={() => setActiveTab(tab)}
    >
      <Icon className="sidebar-icon" />
      <span>{label}</span>
      {badge > 0 && <span className="badge">{badge}</span>}
    </div>
  );

  // Lọc feedback theo trạng thái
  const filterFeedbacks = () => {
    if (feedbackFilter === 'all') {
      return feedbacks;
    }
    
    return feedbacks.filter((feedback, index) => feedbackStatus[index] === feedbackFilter);
  };
  
  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  };

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
          <SidebarItem icon={PieChart} label="Phân tích" tab="analytics" />
          <SidebarItem icon={MessageSquare} label="Phản hồi" tab="feedback" badge={feedbackCount} />
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

        {/* Tab Phân tích */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h1>Phân tích</h1>
            {analyticsError && <div className="alert alert-error">{analyticsError}</div>}
            <div className="sub-tabs">
              <button
                className={`sub-tab ${analyticsSubTab === 'revenue' ? 'active' : ''}`}
                onClick={() => setAnalyticsSubTab('revenue')}
              >
                Doanh thu theo ngày
              </button>
              <button
                className={`sub-tab ${analyticsSubTab === 'customers' ? 'active' : ''}`}
                onClick={() => setAnalyticsSubTab('customers')}
              >
                Số lượng khách theo ngày
              </button>
              <button
                className={`sub-tab ${analyticsSubTab === 'cancel-refunded' ? 'active' : ''}`}
                onClick={() => setAnalyticsSubTab('cancel-refunded')}
              >
                Đơn hủy và Hoàn tiền
              </button>
            </div>
            <div className="date-filter">
              <div className="form-group">
                <label>Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="charts-container">
              {analyticsSubTab === 'revenue' && (
                <div className="chart-card">
                  <Bar data={revenueChartData} options={revenueChartOptions} />
                </div>
              )}
              {analyticsSubTab === 'customers' && (
                <div className="chart-card">
                  <Bar data={customerChartData} options={customerChartOptions} />
                </div>
              )}
              {analyticsSubTab === 'cancel-refunded' && (
                <div className="dual-chart-container">
                  <div className="chart-card">
                    <Bar data={cancelledChartData} options={cancelledChartOptions} />
                  </div>
                  <div className="chart-card">
                    <Bar data={refundedChartData} options={refundedChartOptions} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Phản Hồi */}
        {activeTab === 'feedback' && (
          <div className="feedback-section">
            <h1>Danh Sách Phản Hồi</h1>
            {feedbacks.length === 0 ? (
              <p>Chưa có phản hồi nào.</p>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Nội dung</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((feedback, index) => (
                    <tr key={index}>
                      <td>{feedback.name}</td>
                      <td>{feedback.content}</td>
                      <td>{feedback.email}</td>
                      <td>{feedback.phone || 'Không có'}</td>
                      <td>{new Date(feedback.timestamp).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;