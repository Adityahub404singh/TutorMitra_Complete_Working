import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// User definition with support for id/_id and all necessary fields
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "student" | "tutor";
  city?: string;
  subjects?: string[];
}

interface AuthContextType {
  token: string | null;
  role: "student" | "tutor" | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean; // <-- You can use this in component: const { loading } = useAuth();
  isLoading: boolean; // <-- Also provided if you'd rather use isLoading
  setToken: (token: string | null) => void;
  setRole: (role: "student" | "tutor" | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [role, setRoleState] = useState<"student" | "tutor" | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Provide both `loading` and `isLoading` to suit your usage
  const loading = isLoading;
  const isAuthenticated = Boolean(token && role && user);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("tm_token");
        const storedRole = localStorage.getItem("auth_role") as "student" | "tutor" | null;
        const storedUser = localStorage.getItem("auth_user");
        if (storedToken && storedRole && storedUser) {
          setTokenState(storedToken);
          setRoleState(storedRole);
          setUserState(JSON.parse(storedUser));
          await checkAuth();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("tm_token", newToken);
    } else {
      localStorage.removeItem("tm_token");
    }
    setTokenState(newToken);
  };

  const setRole = (newRole: "student" | "tutor" | null) => {
    if (newRole) {
      localStorage.setItem("auth_role", newRole);
    } else {
      localStorage.removeItem("auth_role");
    }
    setRoleState(newRole);
  };

  const setUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem("auth_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("auth_user");
    }
    setUserState(newUser);
  };

  const clearAuth = () => {
    setTokenState(null);
    setRoleState(null);
    setUserState(null);
    localStorage.removeItem("tm_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_user");
  };

  const logout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const checkAuth = async (): Promise<void> => {
    const storedToken = localStorage.getItem("tm_token");
    if (!storedToken) {
      clearAuth();
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUserState(data.user);
          setRoleState(data.user.role);
          setTokenState(storedToken);
        } else {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        isAuthenticated,
        loading,    // can use `loading` in your UI
        isLoading,  // or use `isLoading` if you prefer
        setToken,
        setRole,
        setUser,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
