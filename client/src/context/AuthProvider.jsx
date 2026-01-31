import { useEffect, useState } from "react";
import { getUser, logout } from "../api/auth.api";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const fetchUser = async () => {
    try {
      const data = await getUser();
      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      setUser(null);
      setIsAuth(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      const data = await logout();
      toast.success(data.message);
    } catch (error) {
      toast.error("Something went wrong :(");
    } finally {
      setUser(null);
      setIsAuth(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []); //whenever we reload, it calls

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuth, setIsAuth, loading, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
