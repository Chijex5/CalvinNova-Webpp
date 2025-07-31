import { formatDistanceToNow } from 'date-fns';
type GetLastActiveParams = {
  chat: any; // if using types: Channel<StreamChatGenerics>
  userId: string;
  humanReadable?: boolean;
};
export function getLastActive({
  chat,
  userId,
  humanReadable = true
}: GetLastActiveParams): string | Date | null {
  try {
    const member = chat?.state?.members?.[userId];
    if (!member || !member.user) {
      console.warn(`No member or user found for ID: ${userId}`);
      return null;
    }
    const lastActive = member.user.last_active;
    if (!lastActive) {
      return null;
    }
    const lastActiveDate = new Date(lastActive);
    return humanReadable ? formatDistanceToNow(lastActiveDate, {
      addSuffix: true
    }) : lastActiveDate;
  } catch (error) {
    console.error('Error retrieving last active time:', error);
    return null;
  }
}