import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="admin-container">
      {/* Sidebar + Header here */}
      <Outlet /> {/* This will render AdminDashboard, AdminNews, etc. */}
    </div>
  );
};

export default AdminLayout;
