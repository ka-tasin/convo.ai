import type { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./custom-components/Navbar";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Profile from "./pages/profile";
import { AuthProvider } from "./contexts/AuthProvider";
import Login from "./pages/Login";
import Register from "./pages/register";

const App: FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
