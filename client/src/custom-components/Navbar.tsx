import type { FC } from "react";
import { Link } from "react-router-dom";

const Navbar: FC = () => {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold">Convo.AI</div>
      <div className="space-x-4">
        <Link to="/" className="hover:text-gray-400">
          Home
        </Link>
        <Link to="/chat" className="hover:text-gray-400">
          Chat
        </Link>
        <Link to="/profile" className="hover:text-gray-400">
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
