import { useState, useRef, useEffect } from "react";
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { apiConnector } from '@/services/apiConnector';
import { authEndpoints } from '@/services/api';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [username, setUsername] = useState<string>(signupData?.username || '');
  const debouncedUsername = useDebouncedValue(username, 500);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

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

    // Username is required at second step
    if (!username || username.trim().length < 3) {
      errors.username = 'Please choose a username (3+ chars)';
    } else if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username.trim())) {
      errors.username = 'Username must be 3-32 chars and may include letters, numbers, . _ -';
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0 && isUsernameAvailable !== false;
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

      // Call signup API with OTP and chosen username
      dispatch(signUp(
        signupData.email,
        signupData.password,
        signupData.confirmPassword,
        otpString,
        username.trim(),
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

  // Check username availability when debounced value changes
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const val = debouncedUsername?.trim();
      if (!val || val.length < 3 || !/^[a-zA-Z0-9._-]{3,32}$/.test(val)) {
        setIsUsernameAvailable(null);
        return;
      }
      setIsCheckingUsername(true);
      try {
        const res = await apiConnector('GET', authEndpoints.CHECK_USERNAME, null, null, { username: val });
        if (!mounted) return;
        const available = res.data && res.data.available;
        setIsUsernameAvailable(!!available);
      } catch (err) {
        console.error('Username check failed', err);
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    check();
    return () => { mounted = false; };
  }, [debouncedUsername]);

  return (
    <div className="mx-auto w-full max-w-lg rounded-[36px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-3xl">
      <div className="flex items-center gap-4 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/35">Verification</p>
          <h1 className="text-2xl font-extralight text-white">Confirm your entry.</h1>
        </div>
      </div>

      <p className="mt-4 text-sm text-white/60 text-center">
        We pushed a 4-digit pulse to <span className="text-white">{signupData.email}</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-center gap-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={formState.isLoading}
                className="h-14 w-14 rounded-2xl border-white/15 bg-white/5 text-center text-xl font-semibold text-white tracking-[0.3em] focus-visible:ring-white/40"
              />
            ))}
          </div>
          {formState.errors.otp && (
            <p className="text-sm text-center text-red-300">{formState.errors.otp}</p>
          )}
        </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs uppercase tracking-[0.4em] text-white/50">Handle</Label>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="choose a handle"
              disabled={formState.isLoading}
              className="h-12 rounded-2xl border-white/15 bg-white/5 px-4 text-white placeholder:text-white/35"
            />
            <div className="mt-2 flex items-center gap-2">
              {isCheckingUsername && <p className="text-xs text-white/50">Checking...</p>}
              {isUsernameAvailable === true && <p className="text-xs text-green-300">Available</p>}
              {isUsernameAvailable === false && <p className="text-xs text-red-300">Taken</p>}
            </div>
            {formState.errors.username && (
              <p className="text-sm text-red-300">{formState.errors.username}</p>
            )}
          </div>

        {formState.errors.general && (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-center text-sm text-red-200">
            {formState.errors.general}
          </p>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-white text-black transition hover:bg-white/90"
          disabled={formState.isLoading || isCheckingUsername || isUsernameAvailable === false || isUsernameAvailable === null}
        >
          {formState.isLoading ? "Verifying..." : "Unlock the feed"}
        </Button>
      </form>

      <div className="mt-8 space-y-2 text-center">
        <p className="text-sm text-white/60">No ping yet?</p>
        <Button
          variant="ghost"
          className="text-sm text-white underline-offset-4 hover:text-white/80"
          onClick={handleResendOtp}
          disabled={formState.countdown > 0 || formState.isResending}
        >
          {formState.isResending
            ? "Sending..."
            : formState.countdown > 0
              ? `Resend in ${formState.countdown}s`
              : "Resend OTP"}
        </Button>
      </div>
    </div>
  );
};
