import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users,
  Settings, 
  LogOut 
} from 'lucide-react';

const StaffDashboard = () => {
  const [activeSection, setActiveSection] = useState('orders');

  const renderContent = () => {
    switch(activeSection) {
      case 'products':
        return <ProductHandling />;
      case 'users':
        return <CustomerSupport />;
      case 'analytics':
        return <Performance />;
      default:
        return <OrderManagement />;
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
          <h2 className="text-xl font-bold">Nhân Viên Dashboard</h2>
        </div>
        <nav className="mt-5">
          <SidebarItem icon={ShoppingCart} label="Quản Lý Đơn Hàng" section="orders" />
          <SidebarItem icon={Package} label="Xử Lý Sản Phẩm" section="products" />
          <SidebarItem icon={Users} label="Chăm Sóc Khách Hàng" section="users" />
          <SidebarItem icon={BarChart3} label="Hiệu Suất" section="analytics" />
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

const OrderManagement = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Quản Lý Đơn Hàng</h1>
    <div className="grid grid-cols-3 gap-5">
      <OrderStatusCard status="Chờ Xác Nhận" count={15} color="text-yellow-600" />
      <OrderStatusCard status="Đang Vận Chuyển" count={25} color="text-blue-600" />
      <OrderStatusCard status="Hoàn Thành" count={50} color="text-green-600" />
    </div>
  </div>
);

const OrderStatusCard = ({ status, count, color }) => (
  <div className="bg-white p-5 rounded-lg shadow-md">
    <h3 className={`${color} mb-2`}>{status}</h3>
    <p className="text-2xl font-bold">{count} Đơn</p>
  </div>
);

const ProductHandling = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Xử Lý Sản Phẩm</h1>
    {/* Thêm chức năng nhập/xuất kho, kiểm tra sản phẩm */}
  </div>
);

const CustomerSupport = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Chăm Sóc Khách Hàng</h1>
    {/* Thêm chức năng hỗ trợ khách hàng, giải quyết khiếu nại */}
  </div>
);

const Performance = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Hiệu Suất Làm Việc</h1>
    {/* Thêm biểu đồ hiệu suất cá nhân */}
  </div>
);

export default StaffDashboard;