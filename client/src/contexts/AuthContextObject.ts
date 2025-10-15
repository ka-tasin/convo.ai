import { createContext } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  token: string;
}

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});
