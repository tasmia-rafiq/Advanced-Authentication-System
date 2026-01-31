import { useState } from "react";
import { login } from "../api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthContext } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Eye, EyeOff, Mail } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState("");
  const { setIsAuth, setUser } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const data = await login(form);
      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      setTimeout(() => {
        setError("");
      }, 3000);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoFocus
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          loading={btnLoading}
          required
        >
          <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
        </Input>

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          loading={btnLoading}
          required
        >
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-2 p-1 rounded"
          >
            {showPassword ? (
              <EyeOff className="text-slate-400" size={18} />
            ) : (
              <Eye className="text-slate-400" size={18} />
            )}
          </button>
        </Input>

        {error && (
          <p className="text-red-500 text-sm mt-2 transition-all duration-500">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Remember me
          </label>

          <a href="/forgot-password" className="text-sm text-indigo-800">
            Forgot password?
          </a>
        </div>

        <Button loading={btnLoading} loadingText={"Signing in"}>Sign in</Button>

        <p className="text-sm text-gray-500 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-medium">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
