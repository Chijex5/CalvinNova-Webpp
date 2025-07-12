import { Channel } from "stream-chat";
export const getUserDisplayName = (userId: string, channel: Channel): string => {
  try {
    const member = channel.state.members[userId];
    if (member?.user?.name) {
      return member.user.name;
    }

    if (member?.user?.id) {
      return member.user.id;
    }

    return 'Unknown User';
  } catch (error) {
    console.error(`Error getting display name for user ${userId}`, error);
    return 'Unknown User';
  }
};