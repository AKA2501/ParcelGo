import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../../api";

type Order = {
  id:number; userId:number; status:string; mode?:string;
  pickupCity?:string; pickupAddr1?:string; dropCity?:string; dropAddr1?:string;
  createdAt?:string; created_at?:string;
};

export default function OrdersList() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/orders?page=0&size=200");
        setRows(Array.isArray(data) ? data : (data.content ?? []));
      } catch (e) {
        setErr(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h1>Orders</h1>
        <Link to="/orders/new" className="btn primary">＋ Create Order</Link>
      </div>

      {err && <div className="card pad" style={{borderColor:"var(--danger)",color:"var(--danger)"}}>{err}</div>}

      {loading ? (
        <div className="card pad">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="empty">
          <div className="muted" style={{marginBottom:10}}>No orders yet.</div>
          <Link to="/orders/new" className="btn primary">Create your first order</Link>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Status</th><th>Mode</th>
                <th>Pickup</th><th>Dropoff</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.userId}</td>
                  <td><span className="badge">{o.status}</span></td>
                  <td>{o.mode ?? "-"}</td>
                  <td>{o.pickupCity ?? o.pickupAddr1 ?? "-"}</td>
                  <td>{o.dropCity ?? o.dropAddr1 ?? "-"}</td>
                  <td>{new Date(o.createdAt ?? o.created_at ?? Date.now()).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
