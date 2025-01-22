import express, { response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import { connectDB } from "./lib/db.js";
import { app, httpServer } from "./lib/socket.js";


// const app = express(); // delete this as we already create an app in socket.io file
dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// **** MIDDLE WARES ****
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser()); //cookie parser middleware
// cors middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));


// ***** ROUTES START*****
app.use('/api/auth', authRoutes); // authentication related routes
app.use('/api/messages', messageRoutes); // Message related routes
// ***** ROUTES END *****


//for production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

// for checking purpose
app.get('/', (req, res) => {
    res.send("Server is running");
})

// listen
httpServer.listen(PORT, () => {
    // console.log("Server is running on PORT: ", PORT);
    connectDB();
})