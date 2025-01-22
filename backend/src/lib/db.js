import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        // console.log("MongoDB Connected: ", conn.connection.host);
        console.log("MongoDB Connected");
    }
    catch (error) {
        console.log("MongoDB Connection Error: ", error);
    }
}