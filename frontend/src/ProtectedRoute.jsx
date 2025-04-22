import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, isAdminLoggedIn }) => {
  const location = useLocation();
  
  if (!isAdminLoggedIn) {
    // Redirect to login if not authenticated, but preserve the requested URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute;