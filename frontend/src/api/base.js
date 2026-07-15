const API_URL = import.meta.env.VITE_API_URL;

export async function request(
  method,
  endpoint,
  data = null,
  customHeaders = {}
) {
  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...customHeaders,
    },
    credentials: "include",
    body: data
      ? isFormData
        ? data
        : JSON.stringify(data)
      : undefined,
  });

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    let message = "Request failed";

    try {
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const error = await res.json();
        message = error.message || message;
      } else {
        const text = await res.text();
        if (text) message = text.slice(0, 300);
      }
    } catch (err) {
      // ignore
    }

    throw new Error(message);
  }

  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }

  return await res.text();
}