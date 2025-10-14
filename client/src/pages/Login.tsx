import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
      // TODO: Implement Google OAuth
      console.log("Google login clicked");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Login Button */}
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={formState.isLoading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-9"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={formState.isLoading}
              />
            </div>
            {formState.errors.email && (
              <p className="text-sm text-destructive">{formState.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-9 pr-9"
                value={formData.password}
                onChange={handleInputChange("password")}
                disabled={formState.isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
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
              <p className="text-sm text-destructive">{formState.errors.password}</p>
            )}
          </div>

          {/* General Error */}
          {formState.errors.general && (
            <p className="text-sm text-destructive text-center">
              {formState.errors.general}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            onClick={handleSubmit}
            disabled={formState.isLoading}
          >
            {formState.isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
