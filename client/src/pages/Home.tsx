import type { FC } from "react";
import { Button } from "../custom-components/Button";

const Home: FC = () => {
  return (
    <div className="p-8 text-center space-y-6">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        Welcome to Convo.AI
      </h1>
      <p className="text-gray-700 dark:text-gray-300">
        Chat with AI instantly. Ask anything, get answers.
      </p>
      <Button>Go to Chat</Button>
    </div>
  );
};

export default Home;
