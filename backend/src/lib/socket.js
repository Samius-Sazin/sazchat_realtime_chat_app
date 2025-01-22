import express from "express";
import http from "http";
import { Server } from "socket.io";

// 1. create express app
const app = express();

// 2. create http server
const httpServer = http.createServer(app);

// 3. socket.io server
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173"],
    }
});


// used to store online users
const userSocketMap = {}; // {userId: socketId}

// for realtime chat, used in send message controller
export const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
}

// socket io connection, (connect, disconnect)
io.on("connection", (socket) => {
    // console.log("User connected: ", socket.id);

    // update the online users
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // io.emit send events to all connected clients
    // send all keys(userId's) to client side
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        // console.log("User disconnected: ", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export { app, httpServer, io };