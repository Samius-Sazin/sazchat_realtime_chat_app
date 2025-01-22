import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import { axiosInstance } from "../lib/axios";


const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    onlineUsers: [],
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/check');
            set({ authUser: response.data });

            //calling socket io
            get().connectSocket();
        }
        catch (error) {
            // console.log("Error is checkAuth: ", error);
            set({ authUser: null });
        }
        finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (formData) => {
        set({ isSigningUp: true });

        try {
            const response = await axiosInstance.post("/auth/signup", formData);
            set({ authUser: response.data });
            toast.success("Account created successfully");

            //calling socket io
            get().connectSocket();
        }
        catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
            set({ isSigningUp: false });
        }
    },

    login: async (formData) => {
        set({ isLoggingIn: true });
        try {
            const response = await axiosInstance.post("/auth/login", formData);
            set({ authUser: response.data });
            toast.success("Logged in successfully");

            //calling socket io
            get().connectSocket();
        }
        catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");

            // disconnect socket
            get().disconnectSocket();
        }
        catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: response.data });
            toast.success("Profile updated successfully");
        }
        catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
            set({ isUpdatingProfile: false });
        }
    },

    getOnlineUsers: async () => {

    },

    // connect to socket
    connectSocket: () => {
        const { authUser } = get();

        if (!authUser || get().socket?.connected) return;

        // create socket, and pass the loggedin userId to server socket
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({ socket: socket });

        //get online users
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    // disconnect from socket
    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
        }
    },
}));