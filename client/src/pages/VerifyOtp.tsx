import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signUp, sendOtp } from "@/services/operations/authAPI";

interface FormState {
  isLoading: boolean;
  isResending: boolean;
  errors: Record<string, string>;
  countdown: number;
}

export const VerifyOtp = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  // Get signup data from Redux store
  const { signupData } = useSelector((state: any) => state.auth);

  // Redirect to signup if no signup data
  useEffect(() => {
    if (!signupData) {
      navigate("/signup");
    }
  }, [signupData, navigate]);

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    isResending: false,
    errors: {},
    countdown: 0,
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (formState.countdown > 0) {
      interval = setInterval(() => {
        setFormState((prev) => ({
          ...prev,
          countdown: prev.countdown - 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [formState.countdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear errors when user starts typing
    if (formState.errors.otp) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, otp: "" },
      }));
    }

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    
    // Only process if it's exactly 4 digits
    if (!/^\d{4}$/.test(pastedData)) return;
    
    const digits = pastedData.split("");
    setOtp(digits);
    
    // Focus the last input
    inputRefs.current[3]?.focus();
  };

  const validateOtp = (): boolean => {
    const errors: Record<string, string> = {};
    
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      errors.otp = "Please enter the complete 4-digit OTP";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOtp()) return;

    if (!signupData) {
      setFormState((prev) => ({
        ...prev,
        errors: { general: "Signup data not found. Please try again." },
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isLoading: true }));

    try {
      const otpString = otp.join("");
      
      // Call signup API with OTP
      dispatch(signUp(
        signupData.email,
        signupData.password,
        signupData.confirmPassword,
        otpString,
        navigate
      ));
    } catch (error) {
      console.error("OTP verification error:", error);
      setFormState((prev) => ({
        ...prev,
        errors: { otp: "Invalid OTP. Please try again." },
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleResendOtp = async () => {
    if (!signupData?.email) {
      setFormState((prev) => ({
        ...prev,
        errors: { general: "Email not found. Please try again." },
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isResending: true }));

    try {
      dispatch(sendOtp(signupData.email, navigate));
      setFormState((prev) => ({ ...prev, countdown: 60 }));
    } catch (error) {
      console.error("Resend OTP error:", error);
      setFormState((prev) => ({
        ...prev,
        errors: { general: "Failed to resend OTP. Please try again." },
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isResending: false }));
    }
  };

  const handleGoBack = () => {
    navigate("/signup");
  };

  // Don't render if no signup data
  if (!signupData) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">
              Verify OTP
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            We've sent a 4-digit verification code to {signupData.email}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Fields */}
            <div className="space-y-2">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={formState.isLoading}
                    className="w-12 h-12 text-center text-lg font-semibold"
                  />
                ))}
              </div>
              {formState.errors.otp && (
                <p className="text-sm text-destructive text-center">
                  {formState.errors.otp}
                </p>
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
              disabled={formState.isLoading}
            >
              {formState.isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="link"
              onClick={handleResendOtp}
              disabled={formState.countdown > 0 || formState.isResending}
              className="text-sm font-medium"
            >
              {formState.isResending
                ? "Sending..."
                : formState.countdown > 0
                ? `Resend in ${formState.countdown}s`
                : "Resend OTP"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
