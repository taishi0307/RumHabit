import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
  
  console.log(`API Request: ${method} ${url}`, data);
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(isDev ? { "Cache-Control": "no-cache" } : {}), // 開発環境では no-cache
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log(`API Response: ${res.status} ${res.statusText}`);
  
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// 開発環境でのキャッシュ問題を防ぐ設定
const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: isDev ? true : false, // 開発環境では window focus で再取得
      staleTime: isDev ? 0 : 1000 * 60 * 5, // 開発環境では即座に古いデータとして扱う
      cacheTime: isDev ? 0 : 1000 * 60 * 5, // 開発環境ではキャッシュ時間を0に
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
