import { useMemo } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';

export const useTypingUsers = (channelId: string): string[] => {
  const typingMap = useChatStore(state => state.typingUsers[channelId] || {});
  const userId = useUserStore(state => state.user?.userId); // ✅ this tracks changes

  return useMemo(() => {
    return Object.keys(typingMap).filter(id => typingMap[id] && id !== userId);
  }, [typingMap, userId]);
};
