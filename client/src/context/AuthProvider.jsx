import { useEffect, useState } from "react";
import { getUser, logout } from "../api/auth.api";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import AppLoader from "../components/AppLoader";

let userCache = null; // in-memory cache

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // initialize from in-memory cache or sessionStorage
    if (userCache) return userCache;

    const stored = sessionStorage.getItem("authUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      // check expiry if implemented
      if (!parsed.expiry || parsed.expiry > Date.now()) {
        userCache = parsed.user;
        return parsed.user;
      } else {
        sessionStorage.removeItem("authUser");
      }
    }

    return null;
  });

  const [loading, setLoading] = useState(!user);
  const [isAuth, setIsAuth] = useState(!!user);

  const fetchUser = async () => {
    if (userCache) {
      setUser(userCache);
      setIsAuth(true);
      setLoading(false);
      return;
    }

    try {
      const data = await getUser();
      setUser(data.user);
      setIsAuth(true);

      // Save in-memory cache
      userCache = data.user;

      // Save in sessionStorage for page refresh
      const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
      sessionStorage.setItem("authUser", JSON.stringify({user: data.user, expiry}));
    } catch (error) {
      setUser(null);
      setIsAuth(false);
      userCache = null;
      sessionStorage.removeItem("authUser");
      console.log("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    const prevUser = user;
    setUser(null);
    setIsAuth(false);
    userCache = null;
    sessionStorage.removeItem("authUser");

    try {
      const data = await logout();
      toast.success(data.message);
    } catch (error) {
      toast.error("Something went wrong :(");

      // rollback
      setUser(prevUser);
      setIsAuth(true);
      userCache = prevUser;
      sessionStorage.setItem("authUser", JSON.stringify({user: prevUser}));
    }
  };

  useEffect(() => {
    // If there is cached user, show immediately, then revalidate in background
    if (user) {
      fetchUser(); // background fetch
    } else {
      fetchUser(); // no cached user, show loader
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuth, setIsAuth, loading, logoutUser }}
    >
      {loading ? <AppLoader /> : children}
    </AuthContext.Provider>
  );
};
