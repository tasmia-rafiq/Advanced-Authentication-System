import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuth } = useAuthContext();

  return isAuth ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;