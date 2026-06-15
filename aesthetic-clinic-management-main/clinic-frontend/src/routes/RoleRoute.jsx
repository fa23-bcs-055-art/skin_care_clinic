import { Navigate } from "react-router-dom";

function RoleRoute({ children, allowedRoles }) {
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'Admin' || user.role === 'SuperAdmin') {
        return <Navigate to="/admin" replace />;
      } else if (user.role === 'User') {
        return <Navigate to="/user" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }

    return children;
  } catch (error) {
    console.error("Error in RoleRoute:", error);
    return <Navigate to="/login" replace />;
  }
}

export default RoleRoute;