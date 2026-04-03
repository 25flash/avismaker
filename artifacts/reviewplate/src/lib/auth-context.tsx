import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetCurrentUser } from "@workspace/api-client-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  plan: string;
  language: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  setAuth: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const storedToken = typeof window !== "undefined" ? localStorage.getItem("reviewplate_token") : null;

  const { data: currentUser, isLoading } = useGetCurrentUser({
    query: { enabled: !!storedToken && !initialized },
  });

  useEffect(() => {
    const t = localStorage.getItem("reviewplate_token");
    if (t) setToken(t);
    if (!t) setInitialized(true);
  }, []);

  useEffect(() => {
    if (currentUser && !initialized) {
      setUser(currentUser as unknown as User);
      setInitialized(true);
    } else if (!isLoading && !currentUser && !initialized) {
      setInitialized(true);
    }
  }, [currentUser, isLoading, initialized]);

  const setAuth = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("reviewplate_token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("reviewplate_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: !initialized,
        isAuthenticated: !!user,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
