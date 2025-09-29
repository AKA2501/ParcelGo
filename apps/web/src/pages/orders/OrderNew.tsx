// apps/web/src/pages/orders/OrderNew.tsx
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { api, getErrorMessage } from "../../api";
import { useNavigate } from "react-router-dom";
import L, { Map as LMap, Marker as LMarker, Polyline as LPolyline } from "leaflet";
import "leaflet/dist/leaflet.css";
import { forwardSearch } from "../../components/MapPicker";

// ---- types ----
type Address = {
  name: string;
  phone: string;
  addr1: string;
  addr2: string;
  city: string;
  state: string;
  postal: string;
  lat?: number | null;
  lng?: number | null;
};

type Intent = "SEND" | "RECEIVE";

// ---- small debounced text input for search boxes ----
function DebouncedInput({
  value,
  onChange,
  placeholder,
  delay = 250,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  delay?: number;
}) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => onChange(v), delay);
    return () => clearTimeout(id);
  }, [v, onChange, delay]);
  useEffect(() => setV(value), [value]);
  return (
    <input
      className="input"
      value={v}
      onChange={(e) => setV(e.target.value)}
      placeholder={placeholder}
    />
  );
}

// ===============================
// Map component with clearMarkers (init ONCE, markers persist)
// ===============================
type OrderMapHandle = {
  clearMarkers: (which: "pickup" | "dropoff" | "all") => void;
};

type OrderMapProps = {
  active: "pickup" | "dropoff";
  pickup: Address;
  dropoff: Address;
  onSet: (
    which: "pickup" | "dropoff",
    v: { lat: number; lng: number; address?: any; display_name?: string }
  ) => void;
  onClose: () => void;
};

const OrderMap = forwardRef<OrderMapHandle, OrderMapProps>(function OrderMap(
  { active, pickup, dropoff, onSet, onClose },
  ref
) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap | null>(null);
  const pickMarkerRef = useRef<LMarker | null>(null);
  const dropMarkerRef = useRef<LMarker | null>(null);
  const lineRef = useRef<LPolyline | null>(null);

  // keep latest props in refs so init effect can stay []
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  const onSetRef = useRef(onSet);
  useEffect(() => { onSetRef.current = onSet; }, [onSet]);

  // Expose a method to clear markers (scoped or all)
  useImperativeHandle(ref, () => ({
    clearMarkers: (which: "pickup" | "dropoff" | "all") => {
      const map = mapRef.current;
      if (!map) return;

      if (which === "pickup" || which === "all") {
        if (pickMarkerRef.current) {
          map.removeLayer(pickMarkerRef.current);
          pickMarkerRef.current = null;
        }
      }
      if (which === "dropoff" || which === "all") {
        if (dropMarkerRef.current) {
          map.removeLayer(dropMarkerRef.current);
          dropMarkerRef.current = null;
        }
      }
      // remove line if either side missing
      if (which === "all" || !pickMarkerRef.current || !dropMarkerRef.current) {
        if (lineRef.current) {
          map.removeLayer(lineRef.current);
          lineRef.current = null;
        }
      }
    },
  }));

  // ✅ init ONCE (doesn't reset on input typing)
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const start: [number, number] =
      pickup.lat != null && pickup.lng != null
        ? [Number(pickup.lat), Number(pickup.lng)]
        : dropoff.lat != null && dropoff.lng != null
        ? [Number(dropoff.lat), Number(dropoff.lng)]
        : [28.6139, 77.209]; // Delhi fallback

    const map = L.map(divRef.current).setView(start, 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const clickHandler = async (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const which = activeRef.current;
      const setFn = onSetRef.current;

      if (which === "pickup") {
        if (pickMarkerRef.current) pickMarkerRef.current.setLatLng([lat, lng]);
        else pickMarkerRef.current = L.marker([lat, lng]).addTo(map);
      } else {
        if (dropMarkerRef.current) dropMarkerRef.current.setLatLng([lat, lng]);
        else dropMarkerRef.current = L.marker([lat, lng]).addTo(map);
      }

      try {
        const { data } = await api.get("/geo/reverse", { params: { lat, lon: lng } });
        setFn(which, { lat, lng, address: data?.address, display_name: data?.display_name });
      } catch {
        setFn(which, { lat, lng });
      }
    };

    map.on("click", clickHandler);
    return () => {
      map.off("click", clickHandler);
      map.remove();
      mapRef.current = null;
      pickMarkerRef.current = null;
      dropMarkerRef.current = null;
      lineRef.current = null;
    };
  }, []); 

  // reflect incoming coords on existing markers and line
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const setMarker = (
      ref: React.MutableRefObject<LMarker | null>,
      lat?: number | null,
      lng?: number | null
    ) => {
      if (lat == null || lng == null) return;
      const ll = L.latLng(Number(lat), Number(lng));
      if (ref.current) ref.current.setLatLng(ll);
      else ref.current = L.marker(ll).addTo(map);
      return ll;
    };

    const pLL = setMarker(pickMarkerRef, pickup.lat, pickup.lng);
    const dLL = setMarker(dropMarkerRef, dropoff.lat, dropoff.lng);

    if (pLL && dLL) {
      if (!lineRef.current) lineRef.current = L.polyline([pLL, dLL]).addTo(map);
      else lineRef.current.setLatLngs([pLL, dLL]);
      map.fitBounds(L.latLngBounds([pLL, dLL]).pad(0.2));
    } else {
      if (pLL) map.setView(pLL, map.getZoom());
      if (dLL) map.setView(dLL, map.getZoom());
      if (lineRef.current) { map.removeLayer(lineRef.current); lineRef.current = null; }
    }
  }, [pickup.lat, pickup.lng, dropoff.lat, dropoff.lng]);

  return (
    <div className="map-panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="map-panel-header" style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px" }}>
        <strong>Set {active === "pickup" ? "Pickup" : "Dropoff"} on Map</strong>
        <button className="btn" onClick={onClose}>Hide</button>
      </div>
      <div ref={divRef} style={{ flex: "1 1 auto", overflow: "hidden" }} />
      <div className="hint" style={{ padding: "8px 12px" }}>
        Click on the map to set the {active}. When both are set, a line shows between them.
      </div>
    </div>
  );
});

// =====================================================
// Main page component
// =====================================================
export default function OrderNew() {
  const nav = useNavigate();

  // -------- form state ----------
  const [userId, setUserId] = useState<string>("");
  const [mode, setMode] = useState<"ON_DEMAND" | "SCHEDULED">("ON_DEMAND");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");

  const [intent, setIntent] = useState<Intent>("SEND"); // NEW: UI-only, not sent to backend

  const [pickup, setPickup] = useState<Address>({
    name: "", phone: "", addr1: "", addr2: "", city: "", state: "", postal: "", lat: null, lng: null,
  });
  const [dropoff, setDropoff] = useState<Address>({
    name: "", phone: "", addr1: "", addr2: "", city: "", state: "", postal: "", lat: null, lng: null,
  });

  const [pkgDescription, setPkgDescription] = useState<string>("");
  const [pkgWeight, setPkgWeight] = useState<string>("");
  const [pkgLen, setPkgLen] = useState<string>("");
  const [pkgWid, setPkgWid] = useState<string>("");
  const [pkgHei, setPkgHei] = useState<string>("");
  const [declaredValue, setDeclaredValue] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // layout/map state
  const [showMap, setShowMap] = useState<boolean>(false);
  const [activeTarget, setActiveTarget] = useState<"pickup" | "dropoff">("pickup");

  // --- Autocomplete state + effects (pickup/dropoff) ---
  const [pickupQuery, setPickupQuery] = useState("");
  const [pickupOpts, setPickupOpts] = useState<any[]>([]);
  const [dropQuery, setDropQuery] = useState("");
  const [dropOpts, setDropOpts] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (pickupQuery && pickupQuery.length >= 3) {
        const data = await forwardSearch(pickupQuery, 6);
        if (!cancelled) setPickupOpts(data);
      } else setPickupOpts([]);
    })();
    return () => { cancelled = true; };
  }, [pickupQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (dropQuery && dropQuery.length >= 3) {
        const data = await forwardSearch(dropQuery, 6);
        if (!cancelled) setDropOpts(data);
      } else setDropOpts([]);
    })();
    return () => { cancelled = true; };
  }, [dropQuery]);

  function onAddrChange(which: "pickup" | "dropoff", field: keyof Address, value: string) {
    if (which === "pickup") setPickup((p) => ({ ...p, [field]: value }));
    else setDropoff((p) => ({ ...p, [field]: value }));
  }

  function choosePickup(o: any) {
    const lat = parseFloat(o.lat), lng = parseFloat(o.lon);
    setPickup({
      ...pickup,
      lat, lng,
      addr1: [o.address?.house_number, o.address?.road].filter(Boolean).join(" ")
             || o.address?.neighbourhood || o.address?.suburb || o.display_name || "",
      city:   o.address?.city || o.address?.town || o.address?.village || "",
      state:  o.address?.state || "",
      postal: o.address?.postcode || "",
    });
    setPickupQuery(o.display_name);
    setPickupOpts([]);
    setActiveTarget("pickup");
    setShowMap(true);
  }

  function chooseDrop(o: any) {
    const lat = parseFloat(o.lat), lng = parseFloat(o.lon);
    setDropoff({
      ...dropoff,
      lat, lng,
      addr1: [o.address?.house_number, o.address?.road].filter(Boolean).join(" ")
             || o.address?.neighbourhood || o.address?.suburb || o.display_name || "",
      city:   o.address?.city || o.address?.town || o.address?.village || "",
      state:  o.address?.state || "",
      postal: o.address?.postcode || "",
    });
    setDropQuery(o.display_name);
    setDropOpts([]);
    setActiveTarget("dropoff");
    setShowMap(true);
  }

  // Called by map when user clicks to set a point
  function handleMapSet(
    which: "pickup" | "dropoff",
    v: { lat: number; lng: number; address?: any; display_name?: string }
  ) {
    if (which === "pickup") {
      setPickup((p) => ({
        ...p,
        lat: v.lat,
        lng: v.lng,
        addr1:
          [v.address?.house_number, v.address?.road].filter(Boolean).join(" ") ||
          v.address?.neighbourhood ||
          v.address?.suburb ||
          v.display_name ||
          "",
        city: v.address?.city || v.address?.town || v.address?.village || "",
        state: v.address?.state || "",
        postal: v.address?.postcode || "",
      }));
      if (v.display_name) setPickupQuery(v.display_name);
    } else {
      setDropoff((p) => ({
        ...p,
        lat: v.lat,
        lng: v.lng,
        addr1:
          [v.address?.house_number, v.address?.road].filter(Boolean).join(" ") ||
          v.address?.neighbourhood ||
          v.address?.suburb ||
          v.display_name ||
          "",
        city: v.address?.city || v.address?.town || v.address?.village || "",
        state: v.address?.state || "",
        postal: v.address?.postcode || "",
      }));
      if (v.display_name) setDropQuery(v.display_name);
    }
  }

  function buildScheduledAtISO(): string | null {
    if (!date) return null;
    const t = time ? time : "00:00";
    const dt = new Date(`${date}T${t}`);
    return dt.toISOString();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!userId.trim()) {
      setError("User ID is required.");
      return;
    }
    if (!pickup.addr1.trim() || !dropoff.addr1.trim()) {
      setError("Pickup and Dropoff address line 1 are required.");
      return;
    }

    const scheduledAt = mode === "SCHEDULED" ? buildScheduledAtISO() : null;

    const body = {
      userId: Number(userId),
      fulfillment: { mode, scheduledAt },
      pickup,
      dropoff,
      pkg: {
        description: pkgDescription || null,
        weightKg: pkgWeight ? Number(pkgWeight) : null,
        dimensionsCm: {
          length: pkgLen ? Number(pkgLen) : null,
          width: pkgWid ? Number(pkgWid) : null,
          height: pkgHei ? Number(pkgHei) : null,
        },
        declaredValue: declaredValue ? Number(declaredValue) : null,
      },
      paymentMethod: paymentMethod || null,
      promoCode: promoCode || null,
    };

    try {
      setSubmitting(true);
      await api.post("/orders", body);
      nav("/orders");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // map handle to clear markers
  const mapHandle = useRef<OrderMapHandle | null>(null);

  // Clear buttons (scoped)
  function clearPickup() {
    setPickup({ name: "", phone: "", addr1: "", addr2: "", city: "", state: "", postal: "", lat: null, lng: null });
    setPickupQuery("");
    setPickupOpts([]);
    mapHandle.current?.clearMarkers("pickup");
  }
  function clearDropoff() {
    setDropoff({ name: "", phone: "", addr1: "", addr2: "", city: "", state: "", postal: "", lat: null, lng: null });
    setDropQuery("");
    setDropOpts([]);
    mapHandle.current?.clearMarkers("dropoff");
  }

  // -------------- NEW: Geolocation helpers --------------
  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) return reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });
  }

  async function reverseLookup(lat: number, lng: number) {
    try {
      const { data } = await api.get("/geo/reverse", { params: { lat, lon: lng } });
      return { address: data?.address, display_name: data?.display_name };
    } catch {
      return { address: undefined, display_name: undefined };
    }
  }

  async function geolocateAndFill(which: "pickup" | "dropoff") {
    try {
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const rev = await reverseLookup(lat, lng);

      // Reuse same setter used by map clicks
      handleMapSet(which, { lat, lng, address: rev.address, display_name: rev.display_name });

      // show & focus map on whichever we just set
      setActiveTarget(which);
      setShowMap(true);
    } catch (err: any) {
      setError(err?.message || "Unable to fetch current location.");
    }
  }

  // When the user chooses SEND/RECEIVE, autofill the correct side with current location
 async function onIntentChange(newIntent: Intent) {
  setIntent(newIntent);

  if (newIntent === "SEND") {
    // Exclusive: clear the other side first
    clearDropoff();
    await geolocateAndFill("pickup");   // fills pickup + drops marker
  } else {
    clearPickup();
    await geolocateAndFill("dropoff");  // fills dropoff + drops marker
  }
}

  return (
    <div className="two-col edge-to-edge" style={{ minHeight: "100vh" }}>
      {/* LEFT: form */}
      <div className="two-col-left left-pane" style={{ overflowY: "auto", maxHeight: "100vh" }}>
        <h1 style={{ margin: "12px 0 8px 0" }}>Create Order</h1>
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={submit} className="card form" style={{ margin: 0, borderRadius: 0, padding: 16 }}>
          {/* Requester */}
          <fieldset className="fieldset">
            <legend>Requester</legend>
            <div className="field-row">
              <label className="label">User ID*</label>
              <input
                className="input"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g., 1"
                inputMode="numeric"
              />
            </div>
            <div className="hint" style={{ marginLeft: 0 }}>Temp: later we’ll read this from the logged-in user.</div>
          </fieldset>

          {/* Fulfillment */}
          <fieldset className="fieldset">
            <legend>Fulfillment</legend>

            <div className="field-row">
              <label className="label">Mode</label>
              <select className="input" value={mode} onChange={(e) => setMode(e.target.value as any)}>
                <option value="ON_DEMAND">ON_DEMAND</option>
                <option value="SCHEDULED">SCHEDULED</option>
              </select>
            </div>

            <div className="grid2">
              <div className="field-row">
                <label className="label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={mode !== "SCHEDULED"}
                />
              </div>
              <div className="field-row">
                <label className="label">Time <span className="muted">(optional)</span></label>
                <input
                  className="input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={mode !== "SCHEDULED"}
                />
              </div>
            </div>

            {/* NEW: Intent + auto geolocate */}
            <div className="field-row">
              <label className="label">I want to</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  className="input"
                  value={intent}
                  onChange={(e) => onIntentChange(e.target.value as Intent)}
                  title="This won't be sent to backend; used to auto-fill address"
                >
                  <option value="SEND">Send Package</option>
                  <option value="RECEIVE">Receive Package</option>
                </select>
                <button
                  type="button"
                  className="btn small"
                  onClick={() => geolocateAndFill(intent === "SEND" ? "pickup" : "dropoff")}
                  title="Retry location detection"
                >
                  Use my location
                </button>
              </div>
            </div>
          </fieldset>

          {/* Pickup */}
          <fieldset className="fieldset">
            <legend>
              Pickup
              <button
                type="button"
                className="btn small"
                style={{ marginLeft: 8 }}
                onClick={() => { setActiveTarget("pickup"); setShowMap(true); }}
              >
                Set on map
              </button>
              <button
                type="button"
                className="btn small"
                style={{ marginLeft: 8 }}
                onClick={() => geolocateAndFill("pickup")}
                title="Fill pickup from current location"
              >
                Use my location
              </button>
              <button
                type="button"
                className="btn small danger"
                style={{ marginLeft: 8 }}
                onClick={clearPickup}
              >
                Clear
              </button>
            </legend>

            <div className="field-row">
              <label className="label">Search address</label>
              <DebouncedInput
                value={pickupQuery}
                onChange={setPickupQuery}
                placeholder="Type address…"
              />
            </div>
            {pickupOpts.length > 0 && (
              <div className="menu">
                {pickupOpts.map((o, i) => (
                  <div key={i} className="menu-item" onClick={() => choosePickup(o)}>
                    {o.display_name}
                  </div>
                ))}
              </div>
            )}

            <div className="grid2" style={{ marginTop: 10 }}>
              <div className="field-row">
                <label className="label">Name</label>
                <input
                  className="input"
                  value={pickup.name}
                  onChange={(e) => onAddrChange("pickup", "name", e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={pickup.phone}
                  onChange={(e) => onAddrChange("pickup", "phone", e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <label className="label">Address Line 1*</label>
              <input
                className="input"
                value={pickup.addr1}
                onChange={(e) => onAddrChange("pickup", "addr1", e.target.value)}
              />
            </div>

            <div className="field-row">
              <label className="label">Address Line 2</label>
              <input
                className="input"
                value={pickup.addr2}
                onChange={(e) => onAddrChange("pickup", "addr2", e.target.value)}
              />
            </div>

            <div className="grid3">
              <div className="field-row">
                <label className="label">City</label>
                <input
                  className="input"
                  value={pickup.city}
                  onChange={(e) => onAddrChange("pickup", "city", e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">State</label>
                <input
                  className="input"
                  value={pickup.state}
                  onChange={(e) => onAddrChange("pickup", "state", e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">Postal Code</label>
                <input
                  className="input"
                  value={pickup.postal}
                  onChange={(e) => onAddrChange("pickup", "postal", e.target.value)}
                />
              </div>
            </div>

            <div className="grid2">
              <div className="field-row">
                <label className="label">Latitude</label>
                <input
                  className="input"
                  value={pickup.lat ?? ""}
                  onChange={(e) =>
                    setPickup((p) => ({ ...p, lat: e.target.value ? Number(e.target.value) : null }))
                  }
                />
              </div>
              <div className="field-row">
                <label className="label">Longitude</label>
                <input
                  className="input"
                  value={pickup.lng ?? ""}
                  onChange={(e) =>
                    setPickup((p) => ({ ...p, lng: e.target.value ? Number(e.target.value) : null }))
                  }
                />
              </div>
            </div>
          </fieldset>

          {/* Dropoff */}
          <fieldset className="fieldset">
            <legend>
              Dropoff
              <button
                type="button"
                className="btn small"
                style={{ marginLeft: 8 }}
                onClick={() => { setActiveTarget("dropoff"); setShowMap(true); }}
              >
                Set on map
              </button>
              <button
                type="button"
                className="btn small"
                style={{ marginLeft: 8 }}
                onClick={() => geolocateAndFill("dropoff")}
                title="Fill dropoff from current location"
              >
                Use my location
              </button>
              <button
                type="button"
                className="btn small danger"
                style={{ marginLeft: 8 }}
                onClick={clearDropoff}
              >
                Clear
              </button>
            </legend>

            <div className="field-row">
              <label className="label">Search address</label>
              <DebouncedInput
                value={dropQuery}
                onChange={setDropQuery}
                placeholder="Type address…"
              />
            </div>
            {dropOpts.length > 0 && (
              <div className="menu">
                {dropOpts.map((o, i) => (
                  <div key={i} className="menu-item" onClick={() => chooseDrop(o)}>
                    {o.display_name}
                  </div>
                ))}
              </div>
            )}

            <div className="grid2" style={{ marginTop: 10 }}>
              <div className="field-row">
                <label className="label">Name</label>
                <input
                  className="input"
                  value={dropoff.name}
                  onChange={(e) => onAddrChange("dropoff", "name", e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={dropoff.phone}
                  onChange={(e) => onAddrChange("dropoff", "phone", e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <label className="label">Address Line 1*</label>
              <input
                className="input"
                value={dropoff.addr1}
                onChange={(e) => onAddrChange("dropoff", "addr1", e.target.value)}
              />
            </div>

            <div className="field-row">
              <label className="label">Address Line 2</label>
              <input
                className="input"
                value={dropoff.addr2}
                onChange={(e) => onAddrChange("dropoff", "addr2", e.target.value)}
              />
            </div>

            <div className="grid3">
              <div className="field-row">
                <label className="label">City</label>
                <input
                  className="input"
                  value={dropoff.city}
                  onChange={(e) => onAddrChange("dropoff", "city", e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">State</label>
                <input
                  className="input"
                  value={dropoff.state}
                  onChange={(e) => onAddrChange("dropoff", "state", e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">Postal Code</label>
                <input
                  className="input"
                  value={dropoff.postal}
                  onChange={(e) => onAddrChange("dropoff", "postal", e.target.value)}
                />
              </div>
            </div>

            <div className="grid2">
              <div className="field-row">
                <label className="label">Latitude</label>
                <input
                  className="input"
                  value={dropoff.lat ?? ""}
                  onChange={(e) =>
                    setDropoff((p) => ({ ...p, lat: e.target.value ? Number(e.target.value) : null }))
                  }
                />
              </div>
              <div className="field-row">
                <label className="label">Longitude</label>
                <input
                  className="input"
                  value={dropoff.lng ?? ""}
                  onChange={(e) =>
                    setDropoff((p) => ({ ...p, lng: e.target.value ? Number(e.target.value) : null }))
                  }
                />
              </div>
            </div>
          </fieldset>

          {/* Package */}
          <fieldset className="fieldset">
            <legend>Package</legend>

            <div className="field-row">
              <label className="label">Description</label>
              <input
                className="input"
                value={pkgDescription}
                onChange={(e) => setPkgDescription(e.target.value)}
              />
            </div>

            <div className="grid4">
              <div className="field-row">
                <label className="label">Weight (kg)</label>
                <input
                  className="input"
                  inputMode="decimal"
                  value={pkgWeight}
                  onChange={(e) => setPkgWeight(e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">Length (cm)</label>
                <input
                  className="input"
                  inputMode="decimal"
                  value={pkgLen}
                  onChange={(e) => setPkgLen(e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">Width (cm)</label>
                <input
                  className="input"
                  inputMode="decimal"
                  value={pkgWid}
                  onChange={(e) => setPkgWid(e.target.value)}
                />
              </div>
              <div className="field-row">
                <label className="label">Height (cm)</label>
                <input
                  className="input"
                  inputMode="decimal"
                  value={pkgHei}
                  onChange={(e) => setPkgHei(e.target.value)}
                />
              </div>
            </div>

            <div className="field-row">
              <label className="label">Declared Value</label>
              <input
                className="input"
                inputMode="decimal"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
              />
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="fieldset">
            <legend>Payment</legend>
            <div className="grid2">
              <div className="field-row">
                <label className="label">Method</label>
                <input
                  className="input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="e.g., COD, CARD, WALLET"
                />
              </div>
              <div className="field-row">
                <label className="label">Promo Code</label>
                <input
                  className="input"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <div className="actions" style={{ paddingTop: 8 }}>
            <button className="btn primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create Order"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => nav("/orders")}
              disabled={submitting}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: collapsible, sticky map */}
      <div
        className={`two-col-right right-pane ${showMap ? "open" : ""}`}
        style={{ position: "sticky", top: 0, height: "100vh" }}
      >
        {!showMap ? (
          <button className="btn block" onClick={() => setShowMap(true)} style={{ width: "100%", height: "48px", borderRadius: 0 }}>
            Show Map
          </button>
        ) : (
          <OrderMap
            ref={mapHandle}
            active={activeTarget}
            pickup={pickup}
            dropoff={dropoff}
            onSet={handleMapSet}
            onClose={() => setShowMap(false)}
          />
        )}
      </div>

      {/* Edge-to-edge + horizontal label/field styles */}
      <style>{`
        .edge-to-edge {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          padding-inline: 12px;
          box-sizing: border-box;
        }
        .left-pane, .right-pane { padding: 0; }
        .left-pane { flex: 1 1 50%; }
        .right-pane { flex: 1 1 50%; background: #f7f7fb; }

        .field-row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 10px;
          align-items: center;
          margin: 8px 0;
        }
        .field-row .label { margin: 0; }
        .field-row .input, .field-row select { width: 100%; }

        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .grid4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }

        .card.form { border-radius: 0; }
        .two-col-right .map-panel { height: 100%; }
      `}</style>
    </div>
  );
}
