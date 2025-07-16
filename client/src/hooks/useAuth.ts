import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    enabled: !!localStorage.getItem("auth_token"), // Only fetch if token exists
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}