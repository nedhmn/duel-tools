import { useAuthStore } from "@/features/auth/store";

export const fetchJson = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const password = useAuthStore.getState().password;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(password && { "X-Auth-Password": password }),
      ...options?.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let message = `Error: ${response.status}`;
    try {
      const error = await response.json();
      if (error.detail) {
        message = error.detail;
      }
    } catch {}
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};
