import React, { useState } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch(activeSection) {
      case 'users':
        return <UsersManagement />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  const SidebarItem = ({ icon: Icon, label, section }) => (
    <div 
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${activeSection === section ? 'bg-gray-200' : ''}`}
      onClick={() => setActiveSection(section)}
    >
      <Icon className="mr-3" />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-md">
        <div className="p-5 border-b text-center">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </div>
        <nav className="mt-5">
          <SidebarItem icon={BarChart3} label="Dashboard" section="dashboard" />
          <SidebarItem icon={Users} label="Quản Lý Người Dùng" section="users" />
          <SidebarItem icon={Package} label="Quản Lý Sản Phẩm" section="products" />
          <SidebarItem icon={ShoppingCart} label="Quản Lý Đơn Hàng" section="orders" />
          <SidebarItem icon={BarChart3} label="Phân Tích" section="analytics" />
          <div className="border-t mt-5">
            <SidebarItem icon={Settings} label="Cài Đặt" section="settings" />
            <div 
              className="flex items-center p-3 text-red-600 cursor-pointer hover:bg-red-50"
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
            >
              <LogOut className="mr-3" />
              <span>Đăng Xuất</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-10 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

const Dashboard = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Tổng Quan</h1>
    <div className="grid grid-cols-4 gap-5">
      <StatCard title="Tổng Người Dùng" value="1,234" />
      <StatCard title="Tổng Sản Phẩm" value="456" />
      <StatCard title="Đơn Hàng Mới" value="78" />
      <StatCard title="Doanh Thu" value="$12,345" />
    </div>
  </div>
);

const StatCard = ({ title, value }) => (
  <div className="bg-white p-5 rounded-lg shadow-md">
    <h3 className="text-gray-500 mb-2">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const UsersManagement = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Quản Lý Người Dùng</h1>
    {/* Thêm bảng và chức năng quản lý người dùng */}
  </div>
);

const ProductManagement = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Quản Lý Sản Phẩm</h1>
    {/* Thêm bảng và chức năng quản lý sản phẩm */}
  </div>
);

const OrderManagement = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Quản Lý Đơn Hàng</h1>
    {/* Thêm bảng và chức năng quản lý đơn hàng */}
  </div>
);

const Analytics = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Phân Tích</h1>
    {/* Thêm biểu đồ và báo cáo */}
  </div>
);

export default AdminDashboard;