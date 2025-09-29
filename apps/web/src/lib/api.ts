import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/api", // gateway
  headers: { "Content-Type": "application/json" },
});

// apps/web/src/api.ts
export async function geoSearch(q: string, limit = 6) {
  const { data } = await api.get("/geo/search", { params: { q, limit } });
  return data as Array<{ display_name: string; lat: string; lon: string; address?: any }>;
}