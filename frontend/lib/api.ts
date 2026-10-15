const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

export function getApiBaseUrl(): string {
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000/api";
  }

  throw new Error(
    "The API URL is not configured. Set NEXT_PUBLIC_API_URL to your backend URL, including /api."
  );
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${getApiBaseUrl()}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Unable to connect to the API at ${url}. Check that the backend is running and that its CORS origin allows this site.`
      );
    }
    throw error;
  }

  const data = await response.json().catch(() => ({
    success: false,
    error: "Failed to parse server response.",
  }));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}
