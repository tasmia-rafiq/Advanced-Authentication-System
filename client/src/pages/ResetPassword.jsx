import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth.api";
import { toast } from "react-toastify";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await resetPassword(token, {password});
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Link.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="New Password"
          type={show ? "text" : "password"}
          name="password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        >
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-2 p-1"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </Input>

        <Button loading={loading} loadingText="Resetting password">
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
