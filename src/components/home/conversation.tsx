// src/components/home/conversation.tsx

import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSeenSvg } from "@/lib/svgs";
import { ImageIcon, Users, VideoIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chat-store";
import { Conversation as ConversationType, User } from "@/lib/types";


const Conversation = ({ conversation }: { conversation: ConversationType }) => {
  const conversationImage = conversation.groupImage || (conversation as any).image;
  const conversationName = conversation.groupName || (conversation as any).name;
  const lastMessage = conversation.lastMessage;
  const lastMessageType = lastMessage?.messageType;

  const me = useQuery(api.users.getMe);

  const { setSelectedConversation, selectedConversation } = useConversationStore();
  const activeBgClass = selectedConversation?._id === conversation._id;

  if (!me) return null;

  const renderMessagePreview = () => {
    if (!lastMessage) return "Say Hi!";
    if (lastMessageType === "text") {
      return lastMessage.content.length > 30
        ? `${lastMessage.content.slice(0, 30)}...`
        : lastMessage.content;
    }
    if (lastMessageType === "image") return <ImageIcon size={16} />;
    if (lastMessageType === "video") return <VideoIcon size={16} />;
    return null;
  };

  return (
    <>
      <div
        className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer
          ${activeBgClass ? "bg-gray-tertiary" : ""}
        `}
        onClick={() => setSelectedConversation(conversation)}
      >
        <Avatar className="border border-gray-900 overflow-visible relative">
          {(conversation as any).isOnline && (
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground" />
          )}
          <AvatarImage
            src={conversationImage || "/placeholder.png"}
            className="object-cover rounded-full"
          />
          <AvatarFallback>
            <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
          </AvatarFallback>
        </Avatar>
        <div className="w-full">
          <div className="flex items-center">
            <h3 className="text-sm font-medium">{conversationName}</h3>
            <span className="text-xs text-gray-500 ml-auto">
              {formatDate(Number(lastMessage?._creationTime || conversation._creationTime))}
            </span>
          </div>
          <p className="text-[12px] mt-1 text-gray-500 flex items-center gap-1">
            {lastMessage?.sender === me._id && <MessageSeenSvg />}
            {conversation.isGroup && <Users size={16} />}
            {renderMessagePreview()}
          </p>
        </div>
      </div>
      <hr className="h-[1px] mx-10 bg-gray-primary" />
    </>
  );
};

export default Conversation;
