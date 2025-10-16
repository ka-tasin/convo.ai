import { io } from "socket.io-client";

export const socket = io("https://convo-ai-hdf2.onrender.com", {
  autoConnect: true,
});
