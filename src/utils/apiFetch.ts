import { apiUrl } from "@/config/env";

export const fetchApiText = async (url: string): Promise<string> => {
  const target = url.startsWith("http") ? url : apiUrl(url);
  const response = await fetch(target, {
    method: "GET",
    headers: { Accept: "text/plain" },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.text()).trim();
};

export const fetchApiJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const target = url.startsWith("http") ? url : apiUrl(url);
  const response = await fetch(target, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};
