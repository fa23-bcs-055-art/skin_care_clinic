import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  
  console.log("ProtectedRoute Check:", { token: !!token, userStr: !!userStr }); // Debug log

  if (!token || !userStr) {
    // Clear any stale data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    console.log("No token/user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (!user) {
      console.log("Invalid user data, redirecting to login");
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;