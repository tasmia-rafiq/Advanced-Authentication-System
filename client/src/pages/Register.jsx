import { useEffect, useMemo, useRef, useState } from "react";
import { checkUsernameAvailability, register } from "../api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../components/ui/Input";
import AuthLayout from "../layouts/AuthLayout";
import { Eye, EyeOff, Mail, User2 } from "lucide-react";
import Button from "../components/ui/Button";

function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("idle");

  // Checking username availability
  const debounceRef = useRef(null);

  useEffect(() => {
    const username = form.username.trim();

    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    debounceRef.current && clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(username);
        setUsernameStatus(
          res.available ? "available" : "taken",
        );
      } catch {
        setUsernameStatus("idle");
      }
    }, 1000);

    return () => clearTimeout(debounceRef.current);
  }, [form.username]);

  const score = useMemo(() => passwordScore(form.password), [form.password]);
  const strengthLabel =
    ["Very weak", "Weak", "Okay", "Good", "Strong"][score] ?? "Very weak";
  const strengthPct = (score / 4) * 100;

  const passwordTooShort =
    form.password.length > 0 && form.password.length <= 7;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const data = await register(form);
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
      setTimeout(() => setError(""), 3000);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Sign up to get started">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Username */}
        <Input
          label="Username"
          type="text"
          name="username"
          placeholder="your_username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value.replace(/\s/g, "") })
          }
          loading={btnLoading}
          required
        >
          <User2 className="absolute right-3 top-3 text-slate-400" size={18} />
        </Input>

        {/* Username helper */}
        <div className="text-sm">
          {usernameStatus === "checking" && (
            <span className="text-slate-400">Checking availability...</span>
          )}
          {usernameStatus === "available" && (
            <span className="text-green-600">Username is available ✓</span>
          )}
          {usernameStatus === "taken" && (
            <span className="text-red-600">Username is already taken.</span>
          )}
        </div>

        {/* Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          loading={btnLoading}
          required
        >
          <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
        </Input>

        {/* Password */}
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="••••••••"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          loading={btnLoading}
          aria-invalid={passwordTooShort}
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

        {/* live helper */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <div className={passwordTooShort ? "text-red-600" : "text-slate-400"}>
            {passwordTooShort
              ? "Password must be at least 8 characters."
              : "Use 8+ characters for better security."}
          </div>
          <div className="text-slate-400">{form.password.length} chars</div>
        </div>

        {/* strength bar */}
        <div className="mt-2">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${strengthPct}%`,
                background:
                  score >= 3
                    ? "linear-gradient(90deg,#10b981,#06b6d4)"
                    : "linear-gradient(90deg,#f97316,#f43f5e)",
              }}
              aria-hidden
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{strengthLabel}</span>
            <span>{form.password.length} chars</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm transition-all duration-500">
            {error}
          </p>
        )}

        <Button loading={btnLoading} loadingText="Creating account">
          Sign up
        </Button>

        <p className="text-sm text-gray-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
