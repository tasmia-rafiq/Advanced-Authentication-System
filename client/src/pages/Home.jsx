import { LogIn } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import imgIcon from "../assets/guard.png";

const Home = () => {
  const { user } = useAuthContext();

  return (
    <section className="flex flex-col items-center justify-center text-center md:gap-4 gap-3 p-4 min-h-screen">
      <div>
        <img src={imgIcon} alt="Icon" className="w-30 mb-2" />
      </div>
      <h1 className="md:text-4xl text-2xl font-semibold">
        Hello{" "}
        <span className="text-indigo-600">{user?.username ?? "Developer"}</span>
        !
      </h1>
      <h2 className="md:text-5xl text-4xl font-bold">
        Welcome to Auth Application
      </h2>

      <p className="mt-4 text-lg font-medium">
        {user
          ? "You are logged in successfully."
          : "Sign in to your existing account or register your account securely."}
      </p>

      {!user && (
        <Link
          to="/register"
          className="btn-primary w-fit! bg-white! text-slate-700! border border-slate-400"
        >
          Get Started <LogIn />
        </Link>
      )}

      {user?.role === "admin" && (
        <Link className="w-25 bg-indigo-600 p-2" to={"/dashboard"}>
          Dashboard
        </Link>
      )}
    </section>
  );
};

export default Home;
