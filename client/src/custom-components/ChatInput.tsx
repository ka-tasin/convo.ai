import { useState } from "react";
import { Button } from "./Button";
import type { FC, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
}

const ChatInput: FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
};

export default ChatInput;
