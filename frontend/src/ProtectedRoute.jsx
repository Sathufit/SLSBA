import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAdminLoggedIn, children }) => {

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
