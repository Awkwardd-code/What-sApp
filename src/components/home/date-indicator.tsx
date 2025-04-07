import { getRelativeDateTime, isSameDay } from "@/lib/utils";
import { IMessage } from "@/store/chat-store";

type DateIndicatorProps = {
  message: IMessage;
  previousMessage?: IMessage; // previousMessage is optional
};

const DateIndicator = ({ message, previousMessage }: DateIndicatorProps) => {
  // Ensure previousMessage exists and has _creationTime before passing it
  const shouldShowDateIndicator =
    !previousMessage || !isSameDay(previousMessage._creationTime, message._creationTime);

  return (
    <>
      {shouldShowDateIndicator && (
        <div className="flex justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 p-1 z-50 rounded-md bg-white dark:bg-gray-primary">
            {getRelativeDateTime(message, previousMessage || null)} {/* Pass null if previousMessage is undefined */}
          </p>
        </div>
      )}
    </>
  );
};

export default DateIndicator;
