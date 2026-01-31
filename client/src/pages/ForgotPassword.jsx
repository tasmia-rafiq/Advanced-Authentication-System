import { useState } from "react"
import { forgotPassword } from "../api/auth.api";
import { toast } from "react-toastify";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/ui/Input";
import { Mail } from "lucide-react";
import Button from "../components/ui/Button";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await forgotPassword({email});
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }
    
  return (
    <AuthLayout
        title="Forgot password?"
        subtitle="We'll send you a reset link"
    >
        <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            >
                <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
            </Input>

            <Button loading={loading} loadingText="Sending link">
                Send reset link
            </Button>
        </form>
    </AuthLayout>
  )
}

export default ForgotPassword