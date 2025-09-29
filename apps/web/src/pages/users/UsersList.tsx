import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

type User = {
  id: number
  name: string
  email: string
  phone?: string
  city?: string
  state?: string
}

export default function UsersList(){
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users')
        setUsers(res.data)
      } catch (e){
        console.error(e)
      } finally { setLoading(false) }
    })()
  }, [])

  const filtered = users.filter(u => {
    const s = (u.name + ' ' + u.email + ' ' + (u.phone||'')).toLowerCase()
    return s.includes(q.toLowerCase())
  })

  return (
    <div className="card">
      <div className="card-head row">
        <div>
          <h1>Users</h1>
          <p className="muted">{users.length} total</p>
        </div>
        <input className="input" style={{maxWidth:360}}
               placeholder="Search name / email / phone"
               value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="alert error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.city || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
