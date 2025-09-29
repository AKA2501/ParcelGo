import React, { useState } from 'react'
import axios from 'axios'

export default function CreateOrder(){
  const [userId, setUserId] = useState('1')
  const [fromCity, setFromCity] = useState('Delhi')
  const [toCity, setToCity] = useState('Noida')
  const [result, setResult] = useState<any>(null)

  const submit = async () => {
    const res = await axios.post('/api/orders', { userId: Number(userId), fromCity, toCity })
    setResult(res.data)
  }

  return <div style={{padding:16}}>
    <h2>Create Order</h2>
    <div style={{display:'grid',gap:8,maxWidth:360}}>
      <input placeholder="userId" value={userId} onChange={e=>setUserId(e.target.value)}/>
      <input placeholder="fromCity" value={fromCity} onChange={e=>setFromCity(e.target.value)}/>
      <input placeholder="toCity" value={toCity} onChange={e=>setToCity(e.target.value)}/>
      <button onClick={submit}>Create</button>
    </div>
    {result && <pre>{JSON.stringify(result,null,2)}</pre>}
  </div>
}
