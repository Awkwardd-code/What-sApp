import { Laugh, Mic, Send } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";
import toast from "react-hot-toast";
import useComponentVisible from "@/hooks/useComponentVisible";
import EmojiPicker, { Theme } from "emoji-picker-react";
import MediaDropdown from "./media-dropdown";

const MessageInput = () => {
	const [msgText, setMsgText] = useState("");
	const { selectedConversation } = useConversationStore();
	const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

	const me = useQuery(api.users.getMe); // Handle undefined gracefully
	const sendTextMsg = useMutation(api.messages.sendTextMessage);

	const handleSendTextMsg = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedConversation || !me) {
			toast.error("No selected conversation or user information available.");
			return;
		}
		try {
			await sendTextMsg({
				content: msgText,
				conversation: selectedConversation._id,
				sender: me._id,
			});
			setMsgText(""); // Clear message input after sending
		} catch (err: any) {
			toast.error("Error sending message: " + err.message);
			console.error(err);
		}
	};

	return (
		<div className='bg-gray-primary p-2 flex gap-4 items-center'>
			<div className='relative flex gap-2 ml-2'>
				{/* EMOJI PICKER */}
				<div ref={ref} onClick={() => setIsComponentVisible(true)}>
					{isComponentVisible && (
						<EmojiPicker
							theme={Theme.DARK}
							onEmojiClick={(emojiObject) => {
								setMsgText((prev) => prev + emojiObject.emoji);
							}}
							style={{
								position: "absolute",
								bottom: "1.5rem",
								left: "1rem",
								zIndex: 50,
							}}
						/>
					)}
					<Laugh className='text-gray-600 dark:text-gray-400 cursor-pointer' />
				</div>
				{/* Media Dropdown Component */}
				<MediaDropdown />
			</div>
			<form onSubmit={handleSendTextMsg} className='w-full flex gap-3'>
				<div className='flex-1'>
					<Input
						type='text'
						placeholder='Type a message'
						className='py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent'
						value={msgText}
						onChange={(e) => setMsgText(e.target.value)}
					/>
				</div>
				<div className='mr-4 flex items-center gap-3'>
					{/* Display either the Send button or Mic button */}
					{msgText.length > 0 ? (
						<Button
							type='submit'
							size={"sm"}
							className='bg-transparent text-foreground hover:bg-transparent'
						>
							<Send />
						</Button>
					) : (
						<Button
							type='submit'
							size={"sm"}
							className='bg-transparent text-foreground hover:bg-transparent'
						>
							<Mic />
						</Button>
					)}
				</div>
			</form>
		</div>
	);
};

export default MessageInput;
