import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.res.user._id;
        // use $ne, take all users excluding the user with id loggedInUserId
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    }
    catch (error) {
        // console.log("Error in getUsersForSidebar controller: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        // take id as userToChatId, means values of id is now in userToChatId
        // const { id: userToChatId } = req.params;
        // or,
        const receiver_id = req.params.id;
        const sender_id = req.res.user._id;

        // using "$or" so get messages if any one is matched
        const messages = await Message.find({
            $or: [
                { senderId: sender_id, receiverId: receiver_id },
                { senderId: receiver_id, receiverId: sender_id },
            ]
        });

        res.status(200).json(messages);
    }
    catch (error) {
        // console.log("Error in getMessages controller: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;

        const { id: receiverId } = req.params;
        const senderId = req.res.user._id;

        let imageUrl = null;

        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            // get the url from response that cloudinary give us
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // socketio real time implementation
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) { // if its true, means the user/receiver is online
            io.to(receiverSocketId).emit("newMessage", newMessage); //only emit to the receiver, not everyone
        }

        res.status(201).json(newMessage);
    }
    catch (error) {
        // console.log("Error in sendMessages controller: ", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

