import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const login = createAsyncThunk("/student/login", async () => {
    try {
        const { data } = await axios.get("/api/student");
        return data;
    } catch (err) {
        return null;
    }
});

export const logout = createAsyncThunk("/student/logout", async () => {
    try {
        await axios.get("/api/student/auth/logout");
        return true;
    } catch (err) {
        return false;
    }
});

export const studentAuthSlice = createSlice({
    name: "student",
    initialState: {
        student: null,
        isLoggingIn: true
    },
    reducers: {
        setIsLoggingIn: (state, action) => {
            state.isLoggingIn = action.payload;
        },
        setStudent: (state, action) => {
            state.student = action.payload;
        }
    },
    extraReducers: builder => {
        builder.addCase(login.fulfilled, (state, action) => {
            if (action.payload) {
                state.student = action.payload;
            }
            state.isLoggingIn = false;
        });
        builder.addCase(logout.fulfilled, (state, action) => {
            // Logout returns true only if successful
            if (action.payload) {
                state.student = null;
            }
            state.isLoggingIn = false;
        });
    }
});

export const { setIsLoggingIn, setStudent } = studentAuthSlice.actions;

export default studentAuthSlice.reducer;
