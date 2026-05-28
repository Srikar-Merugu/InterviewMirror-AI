/**
 * Client-side authentication utility for extracting JWT token from cookies
 * and building authentication headers for API requests.
 */

export const getCookie = (name: string): string => {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
};

export const getAuthHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  const token = getCookie("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};
