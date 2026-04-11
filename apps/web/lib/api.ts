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

  // Token expirado o inválido → cerrar sesión y redirigir al login
  if (res.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada. Por favor ingresá nuevamente.");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData?.message || `Error ${res.status}`);
  }

  return res.json();
}
