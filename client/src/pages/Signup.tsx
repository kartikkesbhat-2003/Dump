import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignupData } from "@/types";
import type { FormState } from "@/types";
import { useDispatch } from "react-redux";
import { setSignupData } from "@/slices/authSlice";
import { sendOtp } from "@/services/operations/authAPI";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export const Signup = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    errors: {},
    touched: {},
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const signupData = { ...formData };

    dispatch(setSignupData(signupData));
    dispatch(sendOtp(formData.email, navigate));

    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const { email, password, confirmPassword } = formData;

  const handleGoogleSignup = async () => {
    try {
      const backend = import.meta.env.VITE_API_BASE_URL || '';
      // Redirect the browser to the backend Google OAuth start route
      window.location.href = `${backend}/auth/google`;
    } catch (error) {
      console.error("Google signup error:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-[36px] border border-white/10 bg-white/[0.04] p-6 lg:max-w-md lg:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-3xl">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-white/35">New here</p>
        <h1 className="text-2xl sm:text-3xl lg:text-2xl font-extralight text-white">Claim your dump handle.</h1>
        <p className="text-sm text-white/60">
          Spin up credentials once and unlock the entire stream.
        </p>
      </div>

      <div className="mt-6 space-y-4 lg:space-y-3">
        <Button
          variant="secondary"
          className="w-full rounded-full border border-white/20 bg-white/95 text-black transition hover:bg-white"
          onClick={handleGoogleSignup}
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

        <form onSubmit={handleOnSubmit} className="space-y-4 lg:space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-[0.4em] text-white/50">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@dump.social"
                className="h-11 lg:h-10 rounded-2xl border-white/15 bg-white/5 pl-12 text-white placeholder:text-white/35 focus-visible:ring-white/40"
                value={email}
                onChange={handleOnChange}
                disabled={formState.isLoading}
              />
            </div>
            {formState.errors.email && (
              <p className="text-sm text-red-400">{formState.errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs uppercase tracking-[0.4em] text-white/50"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a passphrase"
                className="h-11 lg:h-10 rounded-2xl border-white/15 bg-white/5 pl-12 pr-12 text-white placeholder:text-white/35 focus-visible:ring-white/40"
                value={password}
                onChange={handleOnChange}
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

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-xs uppercase tracking-[0.4em] text-white/50"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="One more time"
                className="h-11 lg:h-10 rounded-2xl border-white/15 bg-white/5 pl-12 pr-12 text-white placeholder:text-white/35 focus-visible:ring-white/40"
                value={confirmPassword}
                onChange={handleOnChange}
                disabled={formState.isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 text-white/60 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formState.errors.confirmPassword && (
              <p className="text-sm text-red-400">
                {formState.errors.confirmPassword}
              </p>
            )}
          </div>

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
            {formState.isLoading ? "Creating..." : "Create account"}
          </Button>
        </form>
      </div>

      <div className="pt-6 text-center text-sm text-white/60">
        Already streaming?{" "}
        <Link to="/login" className="text-white hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};
