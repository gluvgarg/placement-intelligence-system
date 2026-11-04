import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import FullPageLoader from "../components/common/FullPageLoader.jsx";

const ProtectedRoute = ({ allowedRoles }) => {

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  const location = useLocation();

  // Wait for authentication initialization
  if (loading) {
    return <FullPageLoader />;
  }

  // Redirect guests to Login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Actual backend role values:
  // admin = administrator
  // user = student
  const role = user?.role?.toLowerCase();

  // Check authorization
  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    const fallbackPath =
      role === "admin"
        ? "/admin/dashboard"
        : role === "user"
        ? "/student/dashboard"
        : "/";

    return (
      <Navigate
        to={fallbackPath}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
