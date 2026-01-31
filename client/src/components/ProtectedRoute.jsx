import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { isAuth, loading } = useAuthContext();

  if (loading) return <Loading />;

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;