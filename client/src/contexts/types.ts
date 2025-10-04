export interface User {
  token: string;
  username?: string;
  email?: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}
