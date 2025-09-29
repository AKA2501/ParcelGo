// apps/web/src/components/MapPicker.tsx
import React, { useEffect, useRef } from "react";
import L, { Map as LMap, Marker as LMarker, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../api";

// --- Leaflet marker icon fix (Vite/Webpack) -------------------
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
(L.Marker.prototype as any).options.icon = DefaultIcon;
// ---------------------------------------------------------------

type Props = {
  value?: { lat?: number | null; lng?: number | null };
  height?: number; // px
  onChange?: (v: {
    lat: number;
    lng: number;
    address?: any;
    display_name?: string;
  }) => void;
};

/**
 * Map with click-to-drop marker + reverse geocoding.
 * Uses onChangeRef so updates fire reliably even after parent re-renders.
 */
export default function MapPicker({ value, onChange, height = 300 }: Props) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap | null>(null);
  const markerRef = useRef<LMarker | null>(null);

  // keep the latest onChange without re-initializing the map
  const onChangeRef = useRef<typeof onChange>();
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // init map once
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const center: LatLngExpression =
      value?.lat != null && value?.lng != null
        ? [Number(value.lat), Number(value.lng)]
        : [28.6139, 77.209]; // Delhi default

    const map = L.map(divRef.current).setView(center, 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const setPoint = async (lat: number, lng: number) => {
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      else markerRef.current = L.marker([lat, lng]).addTo(map);

      try {
        // Gateway baseURL is set in api.ts (http://localhost:8080/api)
        const { data } = await api.get("/geo/reverse", { params: { lat, lon: lng } });
        console.log("reverse data from API",data);
        onChangeRef.current?.({
          lat,
          lng,
          address: data?.address,
          display_name: data?.display_name,
        });
      } catch {
        onChangeRef.current?.({ lat, lng });
      }
    };

    const clickHandler = (e: any) => setPoint(e.latlng.lat, e.latlng.lng);
    map.on("click", clickHandler);

    // initial marker if provided
    if (value?.lat != null && value?.lng != null) {
      setPoint(Number(value.lat), Number(value.lng));
    }

    return () => {
      map.off("click", clickHandler);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once only

  // reflect external value changes by moving the pin
  useEffect(() => {
    if (!mapRef.current) return;
    const lat = value?.lat;
    const lng = value?.lng;
    if (lat == null || lng == null) return;

    const ll = L.latLng(Number(lat), Number(lng));
    if (markerRef.current) markerRef.current.setLatLng(ll);
    else markerRef.current = L.marker(ll).addTo(mapRef.current);

    mapRef.current.setView(ll, mapRef.current.getZoom());
  }, [value?.lat, value?.lng]);

  return <div ref={divRef} style={{ height }} />;
}

// -------- Forward geocoding helper (address -> lat/lon) ----------
export type ForwardResult = {
  display_name: string;
  lat: number;
  lon: number;
  address?: any;
};

/**
 * forwardSearch("Connaught Place, Delhi", 6)
 * -> array of candidates with lat/lon + display name
 */
export async function forwardSearch(q: string, limit = 6): Promise<ForwardResult[]> {
  const query = q?.trim();
  if (!query) return [];
  const { data } = await api.get("/geo/search", { params: { q: query, limit } });
  console.log("forward data from API",data);
  const arr = Array.isArray(data) ? data : [];
  return arr.map((r: any) => ({
    display_name: r?.display_name,
    lat: Number(r?.lat),
    lon: Number(r?.lon),
    address: r?.address,
  }));
}
