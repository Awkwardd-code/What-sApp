"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ImageIcon, MessageSquareDiff } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useConversationStore } from "@/store/chat-store";
import toast from "react-hot-toast";

const UserListDialog = () => {
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [renderedImage, setRenderedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const me = useQuery(api.users.getMe);
  const users = useQuery(api.users.getUsers);
  const createConversation = useMutation(api.conversations.createConversation);
  const generateUploadUrl = useMutation(api.conversations.generateUploadUrl);
  const { setSelectedConversation } = useConversationStore();

  const handleCreateConversation = async () => {
    if (!me || selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      const isGroup = selectedUsers.length > 1;
      let conversationId;

      if (!isGroup) {
        conversationId = await createConversation({
          participants: [me._id, selectedUsers[0]],
          isGroup: false,
        });
      } else {
        const postUrl = await generateUploadUrl();

        const upload = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage?.type || "image/png" },
          body: selectedImage,
        });

        const { storageId } = await upload.json();

        conversationId = await createConversation({
          participants: [...selectedUsers, me._id],
          isGroup: true,
          admin: me._id,
          groupName,
          groupImage: storageId,
        });
      }

      dialogCloseRef.current?.click();
      setSelectedUsers([]);
      setGroupName("");
      setSelectedImage(null);

      const conversationName = isGroup
        ? groupName
        : users?.find((u) => u._id === selectedUsers[0])?.name;

      setSelectedConversation({
        _id: conversationId,
        participants: [me._id, ...selectedUsers],
        isGroup,
        name: conversationName,
        admin: me._id,
        image: isGroup ? renderedImage : users?.find((u) => u._id === selectedUsers[0])?.image,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create conversation");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedImage) return setRenderedImage("");
    const reader = new FileReader();
    reader.onloadend = () => setRenderedImage(reader.result as string);
    reader.readAsDataURL(selectedImage);
  }, [selectedImage]);

  return (
    <Dialog>
      <DialogTrigger>
        <MessageSquareDiff size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a Chat</DialogTitle>
          <DialogDescription>Select users to create a new conversation</DialogDescription>
        </DialogHeader>

        <DialogClose ref={dialogCloseRef} />

        {selectedUsers.length > 1 && (
          <>
            <Input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-2"
            />
            <input
              type="file"
              accept="image/*"
              hidden
              ref={imgRef}
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
            />
            <Button
              variant="outline"
              onClick={() => imgRef.current?.click()}
              className="my-2 gap-2"
            >
              <ImageIcon size={18} />
              Upload Group Image
            </Button>
            {renderedImage && (
              <div className="w-16 h-16 relative mx-auto mb-3">
                <Image
                  src={renderedImage}
                  alt="Group preview"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-2 max-h-64 overflow-auto py-2">
          {users?.map((user) => {
            const isSelected = selectedUsers.includes(user._id);
            return (
              <div
                key={user._id}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${
                  isSelected ? "bg-green-100 dark:bg-green-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => {
                  setSelectedUsers((prev) =>
                    isSelected
                      ? prev.filter((id) => id !== user._id)
                      : [...prev, user._id]
                  );
                }}
              >
                <Avatar>
                  <AvatarImage src={user.image} />
                  <AvatarFallback />
                </Avatar>
                <span>{user.name || user.email.split("@")[0]}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={
              isLoading || selectedUsers.length === 0 || (selectedUsers.length > 1 && !groupName)
            }
            onClick={handleCreateConversation}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserListDialog;
