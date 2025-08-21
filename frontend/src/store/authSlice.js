import {createSlice ,createAsyncThunk, isRejectedWithValue} from "@reduxjs/toolkit"
import { toast } from "react-hot-toast"
import axios from "../lib/axios"

export const signup = createAsyncThunk(
    "auth/signup",
    async({name,email,password,confirmPassword},{isRejectedWithValue})=>{
        if(password !== confirmPassword){
            toast.error("Passwords don't match")
            return isRejectedWithValue("Passwords do not match")
        }
        try {
            const response = await axios.post("/auth/signup",{name,email,password})
            console.log(response.data)
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || "signup failed"
            toast.error(message)
            return isRejectedWithValue(message)
        }


    }
)

export const login = createAsyncThunk(
    "auth/login",
    async({email,password},{isRejectedWithValue})=>{
        try {
            console.log(email,password)
            const response = await axios.post("/auth/login",{email,password})
            return response.data
        } catch (error) {
            const message = error.response?.data?.message || "Login failed"
            toast.error(message)
            return isRejectedWithValue(message)
        }
    }
)


export const logout = createAsyncThunk(
    "auth/logout",
    async(_,{isRejectedWithValue})=>{
        try {
            await axios.post("/auth/logout")
        } catch (error) {
            const message = error.response?.data?.message || "Logout failed"
            toast.error(message)
            return isRejectedWithValue(message)
        }
    }
)

export const checkAuth = createAsyncThunk("auth/checkAuth",async(_,{isRejectedWithValue})=>{
    try {
        const response = await axios.get("/auth/profile")
        return response.data
    } catch (error) {
        return isRejectedWithValue(null)
    }
})

export const refreshToken = createAsyncThunk(
    "auth/refreshtoken",
    async(_,{isRejectedWithValue}) => {
        try {
            const response = await axios.post("/auth/refresh-token")
            return response.data
        } catch (error) {
            return isRejectedWithValue(error)
        }
    }
)
//when using async we don't have to define reducers it's only used for regular non-async code
const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        loading:false,
        isAdmin:false,
        checkingAuth:true,
    },
    reducers:{},
    extraReducers:(builder) =>{
        builder
            .addCase(signup.pending,(state)=>{
                state.loading = true
            })
            .addCase(signup.fulfilled,(state,action)=>{
                state.user = action.payload
                state.isAdmin = action.payload.role === "admin"
                state.loading = false
            })
            .addCase(signup.rejected,(state)=>{
                state.loading = false
            })
            .addCase(login.pending, (state) => {
				state.loading = true
			})
			.addCase(login.fulfilled, (state, action) => {
				state.user = action.payload
                state.isAdmin= action.payload.role === "admin"
				state.loading = false
			})
			.addCase(login.rejected, (state) => {
				state.loading = false
			})
			.addCase(logout.fulfilled, (state) => {
				state.user = null
                state.isAdmin = false
			})
            .addCase(refreshToken.pending, (state) => {
				state.checkingAuth = true
			})
			.addCase(refreshToken.fulfilled, (state) => {
				state.checkingAuth = false
			})
			.addCase(refreshToken.rejected, (state) => {
				state.user = null
				state.checkingAuth = false
			})
            .addCase(checkAuth.pending, (state) => {
				state.checkingAuth = true;
			})
			.addCase(checkAuth.fulfilled, (state, action) => {
				state.user = action.payload;
				state.checkingAuth = false;
			})
			.addCase(checkAuth.rejected, (state) => {
				state.user = null;
				state.checkingAuth = false;
			})
    }
})

export default authSlice.reducer