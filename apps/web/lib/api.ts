import { useAuthStore } from "@/store/authStore";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  const token = useAuthStore.getState().token;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error("API Error");
  }

  return res.json();
}