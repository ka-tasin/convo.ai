import type { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./custom-components/Navbar";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Profile from "./pages/profile";

const App: FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
