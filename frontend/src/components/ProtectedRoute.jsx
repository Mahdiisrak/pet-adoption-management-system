import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("user");
  }

  if (!token || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const rolePaths = {
      ADMIN: "/admin",
      SUPERVISOR: "/supervisor",
      DOCTOR: "/doctor",
      EMPLOYEE: "/employee",
    };

    return (
      <Navigate
        to={rolePaths[user.role] || "/"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
