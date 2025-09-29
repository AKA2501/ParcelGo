import { useState } from "react";
import { api} from "../../lib/api";

type UserPayload = {
  name: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  homeLat?: number | null;
  homeLng?: number | null;
  defaultPaymentMethod?: string;
};

export default function CreateUser() {
  const [form, setForm] = useState<UserPayload>({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    defaultPaymentMethod: "card",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const update =
    (k: keyof UserPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const resp = await api.post("/users", form);
      setResult(resp.data);
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-head">
        <h1>Create User</h1>
        <p className="muted">Add a customer with address & optional payment preference.</p>
      </div>

      <form onSubmit={submit} className="grid gap-16">
        <div className="grid cols-2">
          <div className="field">
            <label>Name *</label>
            <input className="input" value={form.name} onChange={update("name")} required maxLength={100}/>
          </div>
          <div className="field">
            <label>Email *</label>
            <input className="input" type="email" value={form.email} onChange={update("email")} required maxLength={200}/>
          </div>
        </div>

        <div className="grid cols-3">
          <div className="field">
            <label>Phone</label>
            <input className="input" value={form.phone} onChange={update("phone")} placeholder="+919999999999" maxLength={20}/>
          </div>
          <div className="field">
            <label>Country</label>
            <input className="input" value={form.country} onChange={update("country")} maxLength={80}/>
          </div>
          <div className="field">
            <label>Default Payment Method</label>
            <input className="input" value={form.defaultPaymentMethod} onChange={update("defaultPaymentMethod")} maxLength={50}/>
          </div>
        </div>

        <div className="grid cols-2">
          <div className="field">
            <label>Address Line 1</label>
            <input className="input" value={form.addressLine1} onChange={update("addressLine1")} maxLength={120}/>
          </div>
          <div className="field">
            <label>Address Line 2</label>
            <input className="input" value={form.addressLine2} onChange={update("addressLine2")} maxLength={120}/>
          </div>
        </div>

        <div className="grid cols-3">
          <div className="field">
            <label>City</label>
            <input className="input" value={form.city} onChange={update("city")} maxLength={80}/>
          </div>
          <div className="field">
            <label>State</label>
            <input className="input" value={form.state} onChange={update("state")} maxLength={80}/>
          </div>
          <div className="field">
            <label>Postal Code</label>
            <input className="input" value={form.postalCode} onChange={update("postalCode")} maxLength={20}/>
          </div>
        </div>

        <div className="actions">
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create User"}
          </button>
        </div>
      </form>

      {error && <p className="alert error" style={{marginTop:12}}>{error}</p>}
      {result && (
        <pre className="code" style={{marginTop:12}}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
