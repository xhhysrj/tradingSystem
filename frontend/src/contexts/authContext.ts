import { createContext } from "react";

interface UserInfo {
  id: string | null;
  studentId: string | null;
  name: string | null;
  role: string | null;
  major: string | null;
  grade: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: UserInfo) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: {
    id: null,
    studentId: null,
    name: null,
    role: null,
    major: null,
    grade: null
  },
  setIsAuthenticated: () => {},
  setUser: () => {},
  logout: () => {},
});