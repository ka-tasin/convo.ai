import { createContext } from "react";

type AuthContextType = {
  user: { token: string } | null;
  setUser: React.Dispatch<React.SetStateAction<{ token: string } | null>>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});
