// src/lib/stream-chat.ts

import { StreamChat } from 'stream-chat';
const apiKey = import.meta.env.VITE_STREAM_API_KEY; // Use env variable
export const client = StreamChat.getInstance(apiKey, {
  timeout: 10000,
  }
);
