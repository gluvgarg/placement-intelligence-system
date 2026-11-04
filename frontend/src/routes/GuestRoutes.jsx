
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import FullPageLoader from "../components/common/FullPageLoader.jsx";

const GuestRoute = () => {

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  // Wait for authentication initialization
  if (loading) {
    return <FullPageLoader />;
  }

  // Redirect authenticated users
  if (isAuthenticated) {

    const destination =
      user?.role === "admin"
        ? "/admin/dashboard"
        : "/student/dashboard";

    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }

  // Allow guests to access Login/Register
  return <Outlet />;
};

export default GuestRoute;
