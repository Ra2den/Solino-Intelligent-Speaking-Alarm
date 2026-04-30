const API_BASE =
  import.meta.env.VITE_BACKEND_IP?.trim() || "http://localhost:8000";

const request = async (path: string, options: RequestInit = {}) => {
  const normalizedBase = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${normalizedBase}${normalizedPath}`;
  const headers = { "Content-Type": "application/json", ...options.headers };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`API ${response.status}: ${message}`);
  }

  return response.json();
};

export const apiClient = {
  get: (path: string, options?: RequestInit) =>
    request(path, { ...options, method: "GET" }),

  post: (path: string, body: any, options?: RequestInit) =>
    request(path, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: (path: string, body: any, options?: RequestInit) =>
    request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),

  delete: (path: string, options?: RequestInit) =>
    request(path, { ...options, method: "DELETE" }),
};
