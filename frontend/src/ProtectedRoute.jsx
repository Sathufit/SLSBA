import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAdminLoggedIn, children }) => {
<<<<<<< HEAD
  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
=======
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

>>>>>>> cf00e0e27bb95d12f1c8c467c72a0fc52dc1f5e1
  return children;
};

export default ProtectedRoute;
