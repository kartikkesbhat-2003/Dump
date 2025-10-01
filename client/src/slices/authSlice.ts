import { createSlice } from "@reduxjs/toolkit";
import type { SignupData } from "../types";

interface AuthState {
    token: string | null;
    signupData?: SignupData;
    loading?: boolean;
    isTokenValid?: boolean;
}

const initialState: AuthState = {
    token: (() => {
        const stored = localStorage.getItem("token");
        if (!stored) return null;
        try {
            const parsedToken = JSON.parse(stored);
            // Check if token is expired on app load
            try {
                const payload = JSON.parse(atob(parsedToken.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                if (payload.exp < currentTime) {
                    // Token is expired, clear it
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    return null;
                }
            } catch {
                // Invalid token format, clear it
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                return null;
            }
            return parsedToken;
        } catch {
            return stored;
        }
    })(),
    signupData: undefined,
    isTokenValid: true
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setSignupData(state, action: { payload: any }) {
            state.signupData = action.payload;
        },
        setLoading(state, action: { payload: boolean }) {
            state.loading = action.payload;
        },
        setToken(state, action: { payload: string | null }) {
            state.token = action.payload;
            state.isTokenValid = action.payload !== null;
        },
        setTokenValid(state, action: { payload: boolean }) {
            state.isTokenValid = action.payload;
        },
    },
});

export const { setToken, setLoading, setSignupData, setTokenValid } = authSlice.actions;
export default authSlice.reducer;