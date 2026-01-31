import { LogIn, UserLock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuthContext();

  return (
    <header className="fixed top-0 w-full p-5 flex items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2">
        <UserLock size={34} className="text-indigo-500" />
        <h1 className="md:text-4xl text-3xl font-bold text-slate-700">Auth</h1>
      </Link>

      <nav className="flex items-center justify-end gap-4 md:w-80">
        {user ? (
          <button onClick={logoutUser} className="btn-primary w-fit!">
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="btn-primary bg-transparent! text-slate-700! border border-slate-400 max-md:w-fit!"
            >
              <span className="md:flex hidden">Sign in</span> <LogIn />
            </Link>
            <Link to="/register" className="btn-primary md:flex! hidden!">
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
