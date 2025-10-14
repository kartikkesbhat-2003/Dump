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
      console.log("Google signup clicked");
    } catch (error) {
      console.error("Google signup error:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGoogleSignup}
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

          <form onSubmit={handleOnSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-9"
                  value={email}
                  onChange={handleOnChange}
                  disabled={formState.isLoading}
                />
              </div>
              {formState.errors.email && (
                <p className="text-sm text-destructive">{formState.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={handleOnChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-9 pr-9"
                  value={confirmPassword}
                  onChange={handleOnChange}
                  disabled={formState.isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
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
                <p className="text-sm text-destructive">
                  {formState.errors.confirmPassword}
                </p>
              )}
            </div>

            {formState.errors.general && (
              <p className="text-sm text-destructive text-center">
                {formState.errors.general}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={formState.isLoading}
            >
              {formState.isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
