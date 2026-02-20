'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'tenant' | 'landlord' | 'agent';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'chioma_access_token',
  REFRESH_TOKEN: 'chioma_refresh_token',
  USER: 'chioma_user',
} as const;

const AUTH_COOKIE_NAME = 'chioma_auth_token';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sets a simple cookie that the Next.js middleware can read to verify
 * an auth session exists. This is a session marker — not the actual JWT.
 */
function setAuthCookie(token: string) {
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function removeAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Lazy initializer — reads localStorage once on first render.
  // Avoids calling setState inside a useEffect (react-hooks/set-state-in-effect).
  const [state, setState] = useState<AuthState>(() => {
    // localStorage is only available in the browser
    if (typeof window === 'undefined') {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
      };
    }
    try {
      const storedAccessToken = localStorage.getItem(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
      );
      const storedRefreshToken = localStorage.getItem(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
      );
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);

      if (storedAccessToken && storedUser) {
        return {
          user: JSON.parse(storedUser) as User,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          isAuthenticated: true,
          loading: false,
        };
      }
    } catch {
      // Corrupted storage — clear it and start fresh
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      removeAuthCookie();
    }
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
    };
  });

  /**
   * Directly set tokens & user (useful after registration or
   * when the backend response is already available).
   */
  const setTokens = useCallback(
    (accessToken: string, refreshToken: string, user: User) => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
      setAuthCookie(accessToken);

      setState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        loading: false,
      });
    },
    [],
  );

  /**
   * Login with email/password — calls the backend auth endpoint.
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            error:
              errorData.message || 'Invalid credentials. Please try again.',
          };
        }

        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken, data.user);
        return { success: true };
      } catch {
        return {
          success: false,
          error: 'Network error. Please check your connection.',
        };
      }
    },
    [setTokens],
  );

  /**
   * Logout — clears tokens from storage, cookie, and state.
   */
  const logout = useCallback(async () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

    // Best-effort call to backend logout
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Silently fail — we still clear local state
      }
    }

    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    removeAuthCookie();

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
    });

    router.push('/login');
  }, [router]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
