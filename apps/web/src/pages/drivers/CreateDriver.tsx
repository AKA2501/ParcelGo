import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { api } from "../../lib/api";
import L, { Map as LMap, Marker as LMarker, Polyline as LPolyline,LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { forwardSearch } from "../../components/MapPicker"; // same helper you already use

// ---------- Types ----------
type Address = {
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  lat?: number | null;
  lng?: number | null;
};

type DaySchedule = {
  day: number;          // 0..6 (Sun..Sat)
  enabled: boolean;
  start: string;        // "09:00"
  end: string;          // "18:00"
};

type DriverPayload = {
  name: string;
  email: string;
  phone?: string;
  vehicleRegistration?: string;
  maxWeightKg?: number | null;
  startAddress: Address;
  endAddress: Address;
  schedule: DaySchedule[];
};

// ---------- Small debounced input (for address search) ----------
function DebouncedInput({
  value, onChange, placeholder, delay = 250,
}: { value: string; onChange: (v: string) => void; placeholder?: string; delay?: number }) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => onChange(v), delay); return () => clearTimeout(id); }, [v, onChange, delay]);
  useEffect(() => setV(value), [value]);
  return <input className="input" value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} />;
}

// ---------- Map (init once, markers persist) ----------
type MapHandle = { clearMarkers: (which: "start" | "end" | "all") => void };
type MapProps = {
  active: "start" | "end";
  start: Address;
  end: Address;
  onSet: (which: "start" | "end", v: { lat: number; lng: number; address?: any; display_name?: string }) => void;
  onClose: () => void;
};

const DriverMap = forwardRef<MapHandle, MapProps>(function DriverMap({ active, start, end, onSet, onClose }, ref) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap | null>(null);
  const startMarkerRef = useRef<LMarker | null>(null);
  const endMarkerRef = useRef<LMarker | null>(null);
  const lineRef = useRef<LPolyline | null>(null);

  // latest props via refs so init effect can be []
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);
  const onSetRef = useRef(onSet);
  useEffect(() => { onSetRef.current = onSet; }, [onSet]);

  useImperativeHandle(ref, () => ({
    clearMarkers: (which) => {
      const map = mapRef.current; if (!map) return;
      if (which === "start" || which === "all") { if (startMarkerRef.current) { map.removeLayer(startMarkerRef.current); startMarkerRef.current = null; } }
      if (which === "end" || which === "all") { if (endMarkerRef.current) { map.removeLayer(endMarkerRef.current); endMarkerRef.current = null; } }
      if (which === "all" || !startMarkerRef.current || !endMarkerRef.current) {
        if (lineRef.current) { map.removeLayer(lineRef.current); lineRef.current = null; }
      }
    },
  }));

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const startLL: LatLngTuple =
  start.lat != null && start.lng != null
    ? [Number(start.lat), Number(start.lng)]
    : end.lat != null && end.lng != null
    ? [Number(end.lat), Number(end.lng)]
    : [28.6139, 77.209];

    const map = L.map(divRef.current).setView(startLL, 12);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);

    const clickHandler = async (e: any) => {
      const lat = e.latlng.lat, lng = e.latlng.lng;
      const which = activeRef.current;
      if (which === "start") {
        if (startMarkerRef.current) startMarkerRef.current.setLatLng([lat, lng]);
        else startMarkerRef.current = L.marker([lat, lng]).addTo(map);
      } else {
        if (endMarkerRef.current) endMarkerRef.current.setLatLng([lat, lng]);
        else endMarkerRef.current = L.marker([lat, lng]).addTo(map);
      }
      try {
        const { data } = await api.get("/geo/reverse", { params: { lat, lon: lng } });
        onSetRef.current(which, { lat, lng, address: data?.address, display_name: data?.display_name });
      } catch {
        onSetRef.current(which, { lat, lng });
      }
    };

    map.on("click", clickHandler);
    return () => { map.off("click", clickHandler); map.remove(); mapRef.current = null; startMarkerRef.current = null; endMarkerRef.current = null; lineRef.current = null; };
  }, []); // init once

  // reflect coords and line
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const setMarker = (ref: React.MutableRefObject<LMarker | null>, lat?: number | null, lng?: number | null) => {
      if (lat == null || lng == null) return;
      const ll = L.latLng(Number(lat), Number(lng));
      if (ref.current) ref.current.setLatLng(ll); else ref.current = L.marker(ll).addTo(map);
      return ll;
    };
    const sLL = setMarker(startMarkerRef, start.lat, start.lng);
    const eLL = setMarker(endMarkerRef, end.lat, end.lng);

    if (sLL && eLL) {
      if (!lineRef.current) lineRef.current = L.polyline([sLL, eLL]).addTo(map);
      else lineRef.current.setLatLngs([sLL, eLL]);
      map.fitBounds(L.latLngBounds([sLL, eLL]).pad(0.2));
    } else {
      if (sLL) map.setView(sLL, map.getZoom());
      if (eLL) map.setView(eLL, map.getZoom());
      if (lineRef.current) { map.removeLayer(lineRef.current); lineRef.current = null; }
    }
  }, [start.lat, start.lng, end.lat, end.lng]);

  return (
    <div className="map-panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="map-panel-header" style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px" }}>
        <strong>Set {active === "start" ? "Start" : "End"} Address on Map</strong>
        <button className="btn" onClick={onClose}>Hide</button>
      </div>
      <div ref={divRef} style={{ flex: "1 1 auto" }} />
      <div className="hint" style={{ padding: "8px 12px" }}>Click the map to set the location. A line shows when both are set.</div>
    </div>
  );
});

// ---------- Page ----------
const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CreateDriver() {
  const [form, setForm] = useState<DriverPayload>({
    name: "",
    email: "",
    phone: "",
    vehicleRegistration: "",
    maxWeightKg: null,
    startAddress: { addressLine1: "", country: "IN", lat: null, lng: null },
    endAddress:   { addressLine1: "", country: "IN", lat: null, lng: null },
    schedule: days.map((_, i) => ({ day: i, enabled: i >= 1 && i <= 5, start: "09:00", end: "18:00" })), // Mon–Fri default
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTarget, setActiveTarget] = useState<"start" | "end">("start");
  const [showMap, setShowMap] = useState<boolean>(true);

  // address search
  const [startQuery, setStartQuery] = useState("");
  const [startOpts, setStartOpts] = useState<any[]>([]);
  const [endQuery, setEndQuery] = useState("");
  const [endOpts, setEndOpts] = useState<any[]>([]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (startQuery && startQuery.length >= 3) {
        const d = await forwardSearch(startQuery, 6);
        if (!cancel) setStartOpts(d);
      } else setStartOpts([]);
    })();
    return () => { cancel = true; };
  }, [startQuery]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (endQuery && endQuery.length >= 3) {
        const d = await forwardSearch(endQuery, 6);
        if (!cancel) setEndOpts(d);
      } else setEndOpts([]);
    })();
    return () => { cancel = true; };
  }, [endQuery]);

  const mapHandle = useRef<MapHandle | null>(null);

  function setAddr(which: "start" | "end", patch: Partial<Address>) {
    setForm((f) => ({
      ...f,
      [which === "start" ? "startAddress" : "endAddress"]: {
        ...(which === "start" ? f.startAddress : f.endAddress),
        ...patch,
      },
    }));
  }

  function chooseStart(o: any) {
    const lat = parseFloat(o.lat), lng = parseFloat(o.lon);
    setAddr("start", {
      lat, lng,
      addressLine1: [o.address?.house_number, o.address?.road].filter(Boolean).join(" ") || o.address?.neighbourhood || o.address?.suburb || o.display_name || "",
      city: o.address?.city || o.address?.town || o.address?.village || "",
      state: o.address?.state || "",
      postalCode: o.address?.postcode || "",
    });
    setStartQuery(o.display_name);
    setStartOpts([]);
    setActiveTarget("start");
    setShowMap(true);
  }

  function chooseEnd(o: any) {
    const lat = parseFloat(o.lat), lng = parseFloat(o.lon);
    setAddr("end", {
      lat, lng,
      addressLine1: [o.address?.house_number, o.address?.road].filter(Boolean).join(" ") || o.address?.neighbourhood || o.address?.suburb || o.display_name || "",
      city: o.address?.city || o.address?.town || o.address?.village || "",
      state: o.address?.state || "",
      postalCode: o.address?.postcode || "",
    });
    setEndQuery(o.display_name);
    setEndOpts([]);
    setActiveTarget("end");
    setShowMap(true);
  }

  // map -> page
  function handleMapSet(which: "start" | "end", v: { lat: number; lng: number; address?: any; display_name?: string }) {
    setAddr(which, {
      lat: v.lat, lng: v.lng,
      addressLine1: [v.address?.house_number, v.address?.road].filter(Boolean).join(" ") || v.address?.neighbourhood || v.address?.suburb || v.display_name || "",
      city: v.address?.city || v.address?.town || v.address?.village || "",
      state: v.address?.state || "",
      postalCode: v.address?.postcode || "",
    });
    if (which === "start" && v.display_name) setStartQuery(v.display_name);
    if (which === "end" && v.display_name) setEndQuery(v.display_name);
  }

  function clearStart() {
    setForm((f) => ({ ...f, startAddress: { addressLine1: "", country: f.startAddress.country || "IN", lat: null, lng: null } }));
    setStartQuery(""); setStartOpts([]); mapHandle.current?.clearMarkers("start");
  }
  function clearEnd() {
    setForm((f) => ({ ...f, endAddress: { addressLine1: "", country: f.endAddress.country || "IN", lat: null, lng: null } }));
    setEndQuery(""); setEndOpts([]); mapHandle.current?.clearMarkers("end");
  }

  // geolocation
  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) return reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    });
  }
  async function reverseLookup(lat: number, lng: number) {
    try { const { data } = await api.get("/geo/reverse", { params: { lat, lon: lng } }); return { address: data?.address, display_name: data?.display_name }; }
    catch { return { address: undefined, display_name: undefined }; }
  }
  async function useMyLocation(which: "start" | "end") {
    try {
      setError(null);
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      const rev = await reverseLookup(lat, lng);
      handleMapSet(which, { lat, lng, address: rev.address, display_name: rev.display_name });
      setActiveTarget(which); setShowMap(true);
    } catch (e: any) { setError(e?.message || "Unable to fetch current location."); }
  }

  // schedule helpers
  function toggleDay(i: number) {
    setForm((f) => ({ ...f, schedule: f.schedule.map((d, idx) => idx === i ? { ...d, enabled: !d.enabled } : d) }));
  }
  function setDayTime(i: number, which: "start" | "end", val: string) {
    setForm((f) => ({ ...f, schedule: f.schedule.map((d, idx) => idx === i ? { ...d, [which]: val } : d) }));
  }
  function applyToWeekdays(fromIndex: number) {
    setForm((f) => {
      const src = f.schedule[fromIndex];
      return { ...f, schedule: f.schedule.map((d) => d.day >= 1 && d.day <= 5 ? { ...d, enabled: src.enabled, start: src.start, end: src.end } : d) };
    });
  }

  // submit (placeholder endpoint; adjust later)
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null); setResult(null);
    try {
      // for now just echo; later hook to user-service /drivers
      const payload = form;
      console.log("payload for driver request",payload);
      const resp = await api.post("/drivers", payload); // TODO: align when backend ready
      setResult(resp.data);
    } catch (err: any) {
      setError(err?.message || "Failed to create driver");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="two-col edge-to-edge" style={{ minHeight: "100vh" }}>
      {/* LEFT: form */}
      <div className="two-col-left" style={{ overflowY: "auto", maxHeight: "100vh" }}>
        <div className="card-head" style={{ padding: "12px 0" }}>
          <h1>Create Driver</h1>
          <p className="muted">Garage addresses, working hours, and vehicle capacity.</p>
        </div>

        <form onSubmit={submit} className="grid gap-16" style={{ paddingRight: 12 }}>
          {/* Basics */}
          <div className="grid cols-2">
            <div className="field">
              <label>Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100}/>
            </div>
            <div className="field">
              <label>Email *</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={200}/>
            </div>
          </div>

          <div className="grid cols-3">
            <div className="field">
              <label>Phone</label>
              <input className="input" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+919999999999" maxLength={20}/>
            </div>
            <div className="field">
              <label>Vehicle Reg. No.</label>
              <input className="input" value={form.vehicleRegistration || ""} onChange={(e) => setForm({ ...form, vehicleRegistration: e.target.value })} maxLength={40}/>
            </div>
            <div className="field">
              <label>Max Weight (kg)</label>
              <input className="input" value={form.maxWeightKg ?? ""} onChange={(e) => setForm({ ...form, maxWeightKg: e.target.value ? Number(e.target.value) : null })} inputMode="decimal" />
            </div>
          </div>

          {/* Start (Garage) */}
          <div className="card">
            <div className="card-head"><h3>Start (Garage) Address</h3></div>
            <div className="grid gap-8">
              <div className="field">
                <label>Search</label>
                <DebouncedInput value={startQuery} onChange={setStartQuery} placeholder="Type address…" />
                {startOpts.length > 0 && (
                  <div className="menu">
                    {startOpts.map((o, i) => (
                      <div key={i} className="menu-item" onClick={() => chooseStart(o)}>{o.display_name}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid cols-3">
                <div className="field"><label>Address Line 1</label><input className="input" value={form.startAddress.addressLine1} onChange={(e) => setAddr("start",{ addressLine1: e.target.value })}/></div>
                <div className="field"><label>City</label><input className="input" value={form.startAddress.city || ""} onChange={(e) => setAddr("start",{ city: e.target.value })}/></div>
                <div className="field"><label>State</label><input className="input" value={form.startAddress.state || ""} onChange={(e) => setAddr("start",{ state: e.target.value })}/></div>
              </div>
              <div className="grid cols-3">
                <div className="field"><label>Postal Code</label><input className="input" value={form.startAddress.postalCode || ""} onChange={(e) => setAddr("start",{ postalCode: e.target.value })}/></div>
                <div className="field"><label>Country</label><input className="input" value={form.startAddress.country || "IN"} onChange={(e) => setAddr("start",{ country: e.target.value })}/></div>
                <div className="field" style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                  <button type="button" className="btn" onClick={() => { setActiveTarget("start"); setShowMap(true); }}>Set on map</button>
                  <button type="button" className="btn" onClick={() => useMyLocation("start")}>Use my location</button>
                  <button type="button" className="btn danger" onClick={clearStart}>Clear</button>
                </div>
              </div>
              <div className="grid cols-2">
                <div className="field"><label>Latitude</label><input className="input" value={form.startAddress.lat ?? ""} onChange={(e) => setAddr("start",{ lat: e.target.value ? Number(e.target.value) : null })}/></div>
                <div className="field"><label>Longitude</label><input className="input" value={form.startAddress.lng ?? ""} onChange={(e) => setAddr("start",{ lng: e.target.value ? Number(e.target.value) : null })}/></div>
              </div>
            </div>
          </div>

          {/* End (Return Garage) */}
          <div className="card">
            <div className="card-head"><h3>End (Return Garage) Address</h3></div>
            <div className="grid gap-8">
              <div className="field">
                <label>Search</label>
                <DebouncedInput value={endQuery} onChange={setEndQuery} placeholder="Type address…" />
                {endOpts.length > 0 && (
                  <div className="menu">
                    {endOpts.map((o, i) => (
                      <div key={i} className="menu-item" onClick={() => chooseEnd(o)}>{o.display_name}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid cols-3">
                <div className="field"><label>Address Line 1</label><input className="input" value={form.endAddress.addressLine1} onChange={(e) => setAddr("end",{ addressLine1: e.target.value })}/></div>
                <div className="field"><label>City</label><input className="input" value={form.endAddress.city || ""} onChange={(e) => setAddr("end",{ city: e.target.value })}/></div>
                <div className="field"><label>State</label><input className="input" value={form.endAddress.state || ""} onChange={(e) => setAddr("end",{ state: e.target.value })}/></div>
              </div>
              <div className="grid cols-3">
                <div className="field"><label>Postal Code</label><input className="input" value={form.endAddress.postalCode || ""} onChange={(e) => setAddr("end",{ postalCode: e.target.value })}/></div>
                <div className="field"><label>Country</label><input className="input" value={form.endAddress.country || "IN"} onChange={(e) => setAddr("end",{ country: e.target.value })}/></div>
                <div className="field" style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                  <button type="button" className="btn" onClick={() => { setActiveTarget("end"); setShowMap(true); }}>Set on map</button>
                  <button type="button" className="btn" onClick={() => useMyLocation("end")}>Use my location</button>
                  <button type="button" className="btn danger" onClick={clearEnd}>Clear</button>
                </div>
              </div>
              <div className="grid cols-2">
                <div className="field"><label>Latitude</label><input className="input" value={form.endAddress.lat ?? ""} onChange={(e) => setAddr("end",{ lat: e.target.value ? Number(e.target.value) : null })}/></div>
                <div className="field"><label>Longitude</label><input className="input" value={form.endAddress.lng ?? ""} onChange={(e) => setAddr("end",{ lng: e.target.value ? Number(e.target.value) : null })}/></div>
              </div>
            </div>
          </div>

          {/* Working Days & Hours */}
          <div className="card">
            <div className="card-head"><h3>Working Days & Hours</h3></div>
            <div className="grid gap-8">
              {form.schedule.map((d, i) => (
                <div key={i} className="grid cols-4" style={{ alignItems: "center" }}>
                  <div className="field">
                    <label>Day</label>
                    <div className="input" style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="checkbox" checked={d.enabled} onChange={() => toggleDay(i)} />
                      <span>{days[d.day]}</span>
                    </div>
                  </div>
                  <div className="field"><label>Start</label><input className="input" type="time" value={d.start} onChange={(e) => setDayTime(i,"start", e.target.value)} disabled={!d.enabled} /></div>
                  <div className="field"><label>End</label><input className="input" type="time" value={d.end} onChange={(e) => setDayTime(i,"end", e.target.value)} disabled={!d.enabled} /></div>
                  {i === 1 && ( // quick apply from Monday
                    <div className="field">
                      <label>&nbsp;</label>
                      <button type="button" className="btn" onClick={() => applyToWeekdays(1)}>Apply Mon hours to Mon–Fri</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button type="submit" className="btn primary" disabled={submitting}>{submitting ? "Creating…" : "Create Driver"}</button>
          </div>
        </form>

        {error && <p className="alert error" style={{marginTop:12}}>{error}</p>}
        {result && <pre className="code" style={{marginTop:12}}>{JSON.stringify(result, null, 2)}</pre>}
      </div>

      {/* RIGHT: sticky map */}
      <div className={`two-col-right ${showMap ? "open" : ""}`} style={{ position: "sticky", top: 0, height: "100vh" }}>
        {!showMap ? (
          <button className="btn block" onClick={() => setShowMap(true)} style={{ width: "100%", height: 48 }}>
            Show Map
          </button>
        ) : (
          <DriverMap
            ref={mapHandle}
            active={activeTarget}
            start={form.startAddress}
            end={form.endAddress}
            onSet={handleMapSet}
            onClose={() => setShowMap(false)}
          />
        )}
      </div>

      {/* Edge-to-edge small gutter */}
      <style>{`
        .edge-to-edge { width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); padding-inline: 12px; box-sizing: border-box; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid { display: grid; }
        .gap-8 { gap: 8px; } .gap-16 { gap: 16px; }
        .cols-2 { grid-template-columns: 1fr 1fr; } .cols-3 { grid-template-columns: 1fr 1fr 1fr; } .cols-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
        .card { padding: 12px; border: 1px solid #eee; border-radius: 8px; background: #fff; }
        .card-head { margin-bottom: 8px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .input { width: 100%; }
        .menu { border: 1px solid #eee; border-radius: 6px; overflow: hidden; background: #fff; margin-top: 6px; }
        .menu-item { padding: 8px 10px; cursor: pointer; }
        .menu-item:hover { background: #f5f5f7; }
      `}</style>
    </div>
  );
}
