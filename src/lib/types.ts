// src/types.ts

import { Id } from "../../convex/_generated/dataModel"; 

// ===================
// User type
// ===================
export type User = {
  _id: Id<"users">;
  name?: string;
  email: string;
  image: string;
  tokenIdentifier: string;
  isOnline: boolean;
};

// ===================
// Message type
// ===================
export type Message = {
  _id: Id<"messages">;
  conversation: Id<"conversations">;
  sender: Id<"users">; // Ensure sender is always an Id<"users">
  content: string;
  messageType: "text" | "image" | "video";
  _creationTime: number;
};

// ===================
// Conversation type
// ===================
export type Conversation = {
  _id: Id<"conversations">;
  participants: Id<"users">[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  admin?: Id<"users">;
  _creationTime: number;

  // Extended fields for UI
  name?: string; // fallback name when not a group
  image?: string; // fallback image when not a group
  lastMessage?: Message; // Ensure lastMessage follows the Message type
  isOnline?: boolean; // for direct messages, convenience field
};
