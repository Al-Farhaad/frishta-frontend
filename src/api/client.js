import Constants from "expo-constants";

const DEFAULT_API_ROOT = "https://backend-5qyj.onrender.com";
const configuredApiRoot = process.env.EXPO_PUBLIC_API_ROOT || Constants.expoConfig?.extra?.apiRoot || DEFAULT_API_ROOT;
const API_ROOT = configuredApiRoot.replace(/\/+$/, "");
const API_BASE_URL = `${API_ROOT}/api`;

function parseJsonSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function api(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  const timeoutMs = Number(options.timeoutMs || 20000);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await res.text();
  const data = parseJsonSafely(raw);

  if (!res.ok) {
    if (data?.message) throw new Error(data.message);

    if (raw?.trim().startsWith("<")) {
      throw new Error(`Server returned HTML instead of JSON (${res.status}) for ${url}`);
    }

    throw new Error(`Request failed (${res.status})`);
  }

  if (data == null) {
    throw new Error(`Invalid JSON response from ${url}`);
  }

  return data;
}

export function getMediaUrl(mediaPath) {
  if (!mediaPath) return "";
  return `${API_ROOT}${mediaPath}`;
}
