import { useRef, useState } from "react"
import { Image, Send, X } from "lucide-react"
import toast from "react-hot-toast";

import { useChatStore } from "../store/useChatStore";


const MessageInput = () => {
    const { sendMessage, isMessageSending } = useChatStore();
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // encode the image in base64 string
        const reader = new FileReader();
        reader.readAsDataURL(file);

        // reader comes with an onload function
        reader.onload = async () => {
            const base64Image = reader.result; //return a base64 string of the image
            setImagePreview(base64Image);
        }
    }

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!text.trim() && !imagePreview) return;

        try {
            await sendMessage({ text: text.trim(), image: imagePreview });

            // clear form
            setText("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
        catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Message couldn't be send")
        }
    }

    return (
        <div className="p-4 w-full">
            {
                imagePreview
                &&
                (
                    <div className="mb-3 flex items-center gap-2">
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                                type="button"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    </div>
                )
            }

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    {/* image upload input area starts */}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-600"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>
                    {/* image upload input area ends */}
                </div>

                <button
                    type="submit"
                    className={`btn btn-sm btn-circle ${isMessageSending && "animate-pulse"}`}
                    disabled={isMessageSending || (!text.trim() && !imagePreview)}
                >
                    <Send size={18} className="text-zinc-600" />
                </button>
            </form>
        </div>
    )
}

export default MessageInput
