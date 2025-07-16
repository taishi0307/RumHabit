import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const hasToken = !!localStorage.getItem("auth_token");
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    enabled: hasToken, // Only fetch if token exists
  });

  return {
    user,
    isLoading: hasToken ? isLoading : false, // Not loading if no token
    isAuthenticated: !!user,
    error,
  };
}