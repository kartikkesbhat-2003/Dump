import { createSlice } from "@reduxjs/toolkit";
import type { User } from "../types";


interface ProfileState {
    user: User | null;
    loading: boolean;
}

const initialState: ProfileState = {
    user: (() => {
        const stored = localStorage.getItem("user");
        if (!stored) return null;
        return JSON.parse(stored);
    })(),
    loading: false,
};


const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setUser(state, action: { payload: any }) {
            state.user = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        setLoading(state, action: { payload: boolean }) {
            state.loading = action.payload;
        },
    },
});

export const {setUser,setLoading}=profileSlice.actions;
export default profileSlice.reducer;