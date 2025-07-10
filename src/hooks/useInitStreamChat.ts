import { useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { useUserStore } from '../store/userStore'; // adjust this

const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

export const useInitStreamChat = () => {
  const { user, setLoading } = useUserStore();

  useEffect(() => {
    const init = async () => {
      if (!user || !user.userToken) return;

      if (!client.userID) {
        try {
            setLoading(true);
          await client.connectUser(
            {
              id: user.userId,
              name: user.name,
              image: user.avatarUrl,
            },
            user.userToken
          );

          console.log('Stream connected as:', user.name);
        } catch (err) {
          console.error('Stream Chat connect failed:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      if (client.userID) {
        client.disconnectUser();
      }
    };
  }, [user, user?.userToken]);
};
