import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API base URL - can be changed globally
// const API_BASE_URL = "http://64.227.102.139:3001";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uncommon-upskilling.duckdns.org";
// const API_BASE_URL = "http://localhost:3001";

// Utility function to construct full API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}/${endpoint}`;
}

// Decodes a JWT and returns the payload as an object
export function decodeJWT(token: string | null): {
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  avatar?: string;
  tagline?: string;
  role?: string;
} | null {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    // Try id, then sub, then userId
    return {
      id: payload.id || payload.sub || payload.userId,
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      avatar: payload.avatar,
      tagline: payload.tagline,
      role: payload.role,
    };
  } catch (e) {
    return null;
  }
}
