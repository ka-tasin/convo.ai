import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContextObject";
import type { User } from "./AuthContextObject";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return { ...parsedUser, token };
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
