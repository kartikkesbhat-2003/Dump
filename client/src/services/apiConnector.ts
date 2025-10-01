import axios from "axios";
import { toast } from "react-hot-toast";

// Create axios instance
const axiosInstance = axios.create({});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        config.headers.Authorization = `Bearer ${parsedToken}`;
      } catch {
        // If token is not JSON, use it directly
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const tokenExpired = error.response?.data?.tokenExpired;

      console.log("401 error detected, tokenExpired:", tokenExpired);

      if (tokenExpired) {
        // Token has expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Your session has expired. Please login again.");
        window.location.href = "/login";
      } else {
        // Unauthorized access
        console.warn("Unauthorized access - token may be invalid");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Authentication failed. Please login again.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const apiConnector = (method: string, url: string, bodyData?: any, headers?: any, params?: any) => {
  return axiosInstance({
    method: method,
    url: url,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};