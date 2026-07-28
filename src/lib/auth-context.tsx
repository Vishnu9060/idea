"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  userId: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: null,
  isLoading: true,
  isAuthenticated: false,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Protect dashboard routes
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/" && !pathname.startsWith("/api")) {
      // Don't redirect on auth pages
      if (pathname.startsWith("/feed") || pathname.startsWith("/learn") ||
          pathname.startsWith("/practice") || pathname.startsWith("/mentors") ||
          pathname.startsWith("/analytics") || pathname.startsWith("/profile")) {
        router.push("/");
      }
    }
  }, [isLoading, user, pathname, router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?.userId ?? null,
        isLoading,
        isAuthenticated: !!user,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

