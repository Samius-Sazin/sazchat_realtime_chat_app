import toast from "react-hot-toast";
import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore"


export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isMessageSending: false,

    setSelectedUser: (selectedUser) => set({ selectedUser: selectedUser }),

    getUsers: async () => {
        set({ isUsersLoading: true });

        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data });
        }
        catch (error) {
            toast.error(error.response.data.messages);
        }
        finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });

        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data });
        }
        catch (error) {
            toast.error(error.response.data.messages);
        }
        finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async ({ text, image }) => {
        set({ isMessageSending: true });
        try {
            const { selectedUser, messages } = get();
            const receiverId = selectedUser._id;

            const response = await axiosInstance.post(`/messages/send/${receiverId}`, { text, image });
            set({ messages: [...messages, response.data] });
        }
        catch (error) {
            toast.error(error.response.data.messages);
        }
        finally {
            set({ isMessageSending: false });
        }
    },

    listenToMessages: () => {
        const { selectedUser } = get();

        if (!selectedUser) return;

        // get socket from useAUthStore
        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId !== selectedUser._id) return;
            
            set({ messages: [...get().messages, newMessage] });
        });
    },

    notListenToMessages: () => {
        // get socket from useAUthStore
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage")
    },
}))