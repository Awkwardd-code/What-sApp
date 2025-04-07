import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with conditional logic
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a timestamp in ms to a human-readable label like:
 * - "11:30 AM" (if today)
 * - "Yesterday"
 * - "Monday"
 * - "MM/DD/YYYY"
 */
export function formatDate(date_ms: number): string {
  const date = new Date(date_ms);
  const now = new Date();

  // Normalize both to midnight to compare just the date
  const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = normalize(now);
  const messageDate = normalize(date);

  const oneDay = 24 * 60 * 60 * 1000;
  const diff = today.getTime() - messageDate.getTime();

  if (diff === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  if (diff === oneDay) {
    return "Yesterday";
  }

  if (diff < 7 * oneDay) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }

  return date.toLocaleDateString();
}

/**
 * Checks if two timestamps fall on the same calendar day
 */
export const isSameDay = (timestamp1: number, timestamp2: number): boolean => {
  const d1 = new Date(timestamp1);
  const d2 = new Date(timestamp2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Returns relative date string for message grouping
 */
export const getRelativeDateTime = (
  message: { _creationTime: number },
  previousMessage: { _creationTime: number } | null
): string | undefined => {
  const msgDate = new Date(message._creationTime);
  const today = new Date();
  const yesterday = new Date(today);
  const lastWeek = new Date(today);

  yesterday.setDate(today.getDate() - 1);
  lastWeek.setDate(today.getDate() - 7);

  if (!previousMessage || !isSameDay(previousMessage._creationTime, msgDate.getTime())) {
    if (isSameDay(msgDate.getTime(), today.getTime())) return "Today";
    if (isSameDay(msgDate.getTime(), yesterday.getTime())) return "Yesterday";
    if (msgDate.getTime() > lastWeek.getTime()) {
      return msgDate.toLocaleDateString(undefined, { weekday: "long" });
    }

    return msgDate.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return undefined;
};

/**
 * Generates a random alphanumeric ID of given length
 */
export function randomID(len = 5): string {
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  let result = "";

  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
