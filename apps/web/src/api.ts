// Small Axios wrapper that always calls the API via the Gateway on 8080
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/api",
  // if you later add auth: headers: { Authorization: `Bearer ${token}` }
});

// apps/web/src/api.ts
export async function geoSearch(q: string, limit = 6) {
  const { data } = await api.get("/geo/search", { params: { q, limit } });
  console.log("forward search data",data)
  return data as Array<{ display_name: string; lat: string; lon: string; address?: any }>;
}
// Optional: basic error helper
export function getErrorMessage(err: any) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong. Please try again."
  );
}
