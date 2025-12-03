import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/operations/authAPI";
import { Link } from "react-router-dom";

interface LoginData {
  email: string;
  password: string;
}

interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export const Login = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    errors: {},
    touched: {},
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange =
    (field: keyof LoginData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Mark field as touched
      setFormState((prev) => ({
        ...prev,
        touched: { ...prev.touched, [field]: true },
      }));

      // Clear error when user starts typing
      if (formState.errors[field]) {
        setFormState((prev) => ({
          ...prev,
          errors: { ...prev.errors, [field]: "" },
        }));
      }
    };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Call login API
      dispatch(login(formData.email, formData.password, navigate));
    } catch (error) {
      console.error("Login error:", error);
      setFormState((prev) => ({
        ...prev,
        errors: { general: "Login failed. Please try again." },
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const backend = import.meta.env.VITE_API_BASE_URL || '';
      // Redirect the browser to the backend Google OAuth start route
      window.location.href = `${backend}/auth/google`;
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-[36px] border border-white/10 bg-white/[0.04] p-6 lg:max-w-md lg:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-3xl">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-white/35">Log back in</p>
        <h1 className="text-2xl sm:text-3xl lg:text-2xl font-extralight text-white">Welcome to Dump.</h1>
        <p className="text-sm text-white/60">
          Pick up the timeline exactly where you left it.
        </p>
      </div>

      <div className="mt-6 space-y-4 lg:space-y-3">
        <Button
          variant="secondary"
          className="w-full rounded-full border border-white/20 bg-white/95 text-black transition hover:bg-white"
          onClick={handleGoogleLogin}
          disabled={formState.isLoading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
          <span className="h-px flex-1 bg-white/15" />
          <span>or email</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        <form className="space-y-4 lg:space-y-3" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-[0.4em] text-white/50">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="email"
                type="email"
                placeholder="you@dump.social"
                className="h-11 lg:h-10 rounded-2xl border-white/15 bg-white/5 pl-12 text-white placeholder:text-white/35 focus-visible:ring-white/40"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={formState.isLoading}
              />
            </div>
            {formState.errors.email && (
              <p className="text-sm text-red-400">{formState.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs uppercase tracking-[0.4em] text-white/50"
              >
                Password
              </Label>
              {/* <Link
                to="/forgot-password"
                className="text-sm font-medium text-white/70 underline-offset-4 hover:text-white"
              >
                Forgot?
              </Link> */}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-11 lg:h-10 rounded-2xl border-white/15 bg-white/5 pl-12 pr-12 text-white placeholder:text-white/35 focus-visible:ring-white/40"
                value={formData.password}
                onChange={handleInputChange("password")}
                disabled={formState.isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 text-white/60 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formState.errors.password && (
              <p className="text-sm text-red-400">{formState.errors.password}</p>
            )}
          </div>

          {/* General Error */}
          {formState.errors.general && (
            <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-center text-sm text-red-200">
              {formState.errors.general}
            </p>
          )}

          <Button
            type="submit"
            className="h-10 lg:h-11 w-full rounded-full bg-white text-black transition hover:bg-white/90"
            disabled={formState.isLoading}
          >
            {formState.isLoading ? "Signing In..." : "Continue"}
          </Button>
        </form>
      </div>

      <div className="pt-6 text-center text-sm text-white/60">
        Need an account?{" "}
        <Link to="/signup" className="text-white hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
};
