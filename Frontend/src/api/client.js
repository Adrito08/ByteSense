const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = payload?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export const api = {
  root: () => request("/"),
  health: () => request("/health"),
  analyzeFile: (file, frames = 20) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("frames", String(frames));
    return request("/analyze", {
      method: "POST",
      body: formData,
    });
  },
};

export default api;
