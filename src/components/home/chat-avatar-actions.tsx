import React from "react";
import { IMessage, useConversationStore } from "@/store/chat-store";
import { useMutation } from "convex/react";
import { Ban, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type User = {
	_id: Id<"users">;
	isOnline?: boolean;
	image?: string;
};

type ChatAvatarActionsProps = {
	message: IMessage;
	me: User;
};

const ChatAvatarActions = ({ me, message }: ChatAvatarActionsProps) => {
	const { selectedConversation, setSelectedConversation } = useConversationStore();

	const isMember = selectedConversation?.participants.includes(message.sender._id);
	const kickUser = useMutation(api.conversations.kickUser);
	const createConversation = useMutation(api.conversations.createConversation);
	const fromAI = message.sender?.name === "ChatGPT";
	const isGroup = selectedConversation?.isGroup;

	const handleKickUser = async (e: React.MouseEvent) => {
		if (fromAI) return;
		e.stopPropagation();
		if (!selectedConversation) return;

		try {
			await kickUser({
				conversationId: selectedConversation._id,
				userId: message.sender._id as Id<"users">,
			});

			setSelectedConversation({
				...selectedConversation,
				participants: selectedConversation.participants.filter(
					(id) => id !== message.sender._id
				),
			});
		} catch {
			toast.error("Failed to kick user");
		}
	};

	const handleCreateConversation = async () => {
		if (fromAI) return;

		try {
			const conversationId = await createConversation({
				isGroup: false,
				participants: [me._id, message.sender._id as Id<"users">],
			});

			setSelectedConversation({
				_id: conversationId,
				name: message.sender.name,
				participants: [me._id, message.sender._id as Id<"users">],
				isGroup: false,
				isOnline: message.sender.isOnline,
				image: message.sender.image,
			});
		} catch {
			toast.error("Failed to create conversation");
		}
	};

	return (
		<div
			className='text-[11px] flex gap-4 justify-between font-bold cursor-pointer group'
			onClick={handleCreateConversation}
		>
			{isGroup && message.sender.name}

			{!isMember && !fromAI && isGroup && <Ban size={16} className='text-red-500' />}
			{isGroup && isMember && selectedConversation?.admin === me._id && (
				<LogOut
					size={16}
					className='text-red-500 opacity-0 group-hover:opacity-100'
					onClick={handleKickUser}
				/>
			)}
		</div>
	);
};

export default ChatAvatarActions;
