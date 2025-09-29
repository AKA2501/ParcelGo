import { useEffect, useState } from "react";
import { api } from "../../lib/api";

type Driver = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  vehicleRegistration?: string;
  maxWeightKg?: number | null;
  // these may come flattened OR inside startAddress/endAddress; we handle both when rendering
  startCity?: string;
  endCity?: string;
};

export default function DriversList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/drivers");
        setDrivers(res.data || []);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load drivers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = drivers.filter((d) => {
    const startCity =
      (d as any).startCity ||
      (d as any).start_address?.city ||
      (d as any).startAddress?.city ||
      "";
    const endCity =
      (d as any).endCity ||
      (d as any).end_address?.city ||
      (d as any).endAddress?.city ||
      "";
    const s = (
      (d.name || "") +
      " " +
      (d.email || "") +
      " " +
      (d.phone || "") +
      " " +
      (d.vehicleRegistration || "") +
      " " +
      startCity +
      " " +
      endCity
    ).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <div className="card">
      <div className="card-head row">
        <div>
          <h1>Drivers</h1>
          <p className="muted">{drivers.length} total</p>
        </div>
        <input
          className="input"
          style={{ maxWidth: 360 }}
          placeholder="Search name / email / phone / vehicle"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="alert error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Max Kg</th>
                <th>Start City</th>
                <th>End City</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const startCity =
                  (d as any).startCity ||
                  (d as any).start_address?.city ||
                  (d as any).startAddress?.city ||
                  "-";
                const endCity =
                  (d as any).endCity ||
                  (d as any).end_address?.city ||
                  (d as any).endAddress?.city ||
                  "-";
                return (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.phone || "-"}</td>
                    <td>{d.vehicleRegistration || "-"}</td>
                    <td>{d.maxWeightKg ?? "-"}</td>
                    <td>{startCity}</td>
                    <td>{endCity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
