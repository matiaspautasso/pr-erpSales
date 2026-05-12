import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

const TOKEN_KEY = 'polleria_token';

interface JwtPayload {
  sub: number;
  email: string;
  exp: number;
}

interface AuthContextValue {
  user: JwtPayload | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseToken(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

function getStoredUser(): JwtPayload | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const payload = parseToken(token);
  if (!payload) return null;
  if (payload.exp * 1000 < Date.now()) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(getStoredUser);

  const login = useCallback((token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(parseToken(token));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
