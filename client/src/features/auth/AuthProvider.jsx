import { createContext, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../../services/api";

const AuthContext = createContext(null);
const SESSION_CACHE_KEY = "rcf_session";

function readCachedUser() {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeCachedUser(user) {
  try {
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

async function fetchSessionUser() {
  try {
    const data = await api.fetchSession();
    writeCachedUser(data.user);
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      writeCachedUser(null);
      return null;
    }

    throw error;
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const cachedUser = readCachedUser();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: fetchSessionUser,
    staleTime: 5 * 60 * 1000,
    ...(cachedUser !== undefined && { initialData: cachedUser })
  });

  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: (data) => {
      writeCachedUser(data.user);
      queryClient.setQueryData(["session"], data.user);
    }
  });

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      writeCachedUser(data.user);
      queryClient.setQueryData(["session"], data.user);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      writeCachedUser(null);
      queryClient.setQueryData(["session"], null);
      queryClient.removeQueries({ queryKey: ["decks"] });
    }
  });

  const value = useMemo(
    () => ({
      user: sessionQuery.data || null,
      isLoading: sessionQuery.isLoading,
      isAuthenticated: Boolean(sessionQuery.data),
      register: registerMutation.mutateAsync,
      login: loginMutation.mutateAsync,
      logout: logoutMutation.mutateAsync,
      isAuthenticating:
        registerMutation.isPending || loginMutation.isPending || logoutMutation.isPending
    }),
    [
      loginMutation.isPending,
      loginMutation.mutateAsync,
      logoutMutation.isPending,
      logoutMutation.mutateAsync,
      registerMutation.isPending,
      registerMutation.mutateAsync,
      sessionQuery.data,
      sessionQuery.isLoading
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

