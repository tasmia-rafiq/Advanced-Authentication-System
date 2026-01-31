import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Loading from "./Loading";

const PublicRoute = () => {
  const { isAuth, loading } = useAuthContext();

  if (loading) return <Loading />;
  if (isAuth) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PublicRoute;