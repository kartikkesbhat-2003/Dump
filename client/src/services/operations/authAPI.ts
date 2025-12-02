import { toast } from "react-hot-toast"
import { setLoading, setToken } from "@/slices/authSlice"
import { setUser } from "@/slices/profileSlice"
import { authEndpoints } from "@/services/api"
import { apiConnector } from "../apiConnector"
import { setProgress } from "@/slices/loadingBarSlice"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
} = authEndpoints

export function sendOtp(email: string, navigate: any) {
  return async (dispatch: any) => {
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      })
      dispatch(setProgress(100));

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("OTP Sent Successfully")
      navigate("/verify-email")
    } catch (error) {
      console.error("SENDOTP API ERROR:", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Failed to send OTP"
      )
      dispatch(setProgress(100));
    }
    dispatch(setLoading(false))
  }
}

export function signUp(
  email: string,
  password: string,
  confirmPassword: string,
  otp: string,
  navigate: any
) {
  return async (dispatch: any) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        email,
        password,
        confirmPassword,
        otp,
      })

      // Signup API response handled
      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      dispatch(setProgress(100));
      toast.success("Signup Successful")
      navigate("/login")
    } catch (error) {
      dispatch(setProgress(100));
      console.error("SIGNUP API ERROR:", error)
      toast.error("Signup Failed")
      navigate("/signup")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function login(email: string, password: string, navigate: any) {
  return async (dispatch: any) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      // Login API response handled
      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      dispatch(setProgress(100))
      toast.success("Login Successful")
      dispatch(setToken(response.data.token))
      localStorage.setItem("user", JSON.stringify(response.data.user))
      localStorage.setItem("token", JSON.stringify(response.data.token))
      navigate("/")
    } catch (error) {
      dispatch(setProgress(100))
      console.error("LOGIN API ERROR:", error)
      toast.error(
        (error as any)?.response?.data?.message || (error as Error).message || "Login Failed"
      )
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


export function logout(navigate: any) {
  return (dispatch: any) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}