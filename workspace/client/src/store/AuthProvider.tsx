import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import axios from "axios";

// API BASE URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// User type
export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "student" | "tutor";
  city?: string;
  subjects?: string[];
}

// Context type
interface AuthContextType {
  user: AuthUser | null;
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  role: string | null;
  setRole: Dispatch<SetStateAction<string | null>>;
  logout: () => void;
  loading: boolean;
}

// React Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
    localStorage.removeItem("auth_role");
    // Optional: window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("tm_token");
    let storedUser = localStorage.getItem("tm_user");
    const storedRole = localStorage.getItem("auth_role");

    // Defensive: ignore blank or undefined user
    if (
      token &&
      storedUser &&
      storedUser !== "undefined" &&
      storedUser.trim() !== ""
    ) {
      try {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(storedRole || parsedUser.role || null);
        setLoading(false);

        // Optionally verify session with backend
        axios
          .get(`${API_BASE_URL}/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            if (res.data?.data) {
              setUser(res.data.data);
              setRole(res.data.data.role || storedRole || null);
              localStorage.setItem("tm_user", JSON.stringify(res.data.data));
              localStorage.setItem(
                "auth_role",
                res.data.data.role || ""
              );
            }
          })
          .catch(() => logout());
        return;
      } catch {
        // Invalid JSON or user, force logout
        logout();
        return;
      }
    }

    setUser(null);
    setRole(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, role, setRole, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
