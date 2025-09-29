import { useRef, useState } from 'react'
import * as SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs'

export default function Track(){
  const [connected, setConnected] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const clientRef = useRef<Client | null>(null)
  const orderId = 1 // TODO: bind to input/route param

  const connect = () => {
    if (clientRef.current?.active) return
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true)
        setLogs(l => [...l, `[connected] Subscribing to /topic/orders/${orderId}`])
        client.subscribe(`/topic/orders/${orderId}`,(msg: IMessage) => {
          setLogs(l => [...l, `[msg] ${msg.body}`])
        })
      },
      onStompError: (f) => setLogs(l => [...l, `[stomp-error] ${f.headers['message']}`]),
      onWebSocketError: (e) => setLogs(l => [...l, `[ws-error] ${String(e)}`]),
      onDisconnect: () => setConnected(false)
    })
    client.activate()
    clientRef.current = client
  }

  const disconnect = () => {
    clientRef.current?.deactivate()
    clientRef.current = null
    setConnected(false)
  }

  const sendMock = () => {
    clientRef.current?.publish({
      destination: '/app/locate',
      body: JSON.stringify({ orderId, lat: 28.61 + Math.random()/100, lng: 77.20 + Math.random()/100, ts: Date.now() })
    })
  }

  return (
    <div>
      <h1>Order Tracking</h1>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <div style={{display:'flex', gap:8}}>
        <button onClick={connect} disabled={connected}>Connect</button>
        <button onClick={disconnect} disabled={!connected}>Disconnect</button>
        <button onClick={sendMock} disabled={!connected}>Send mock location</button>
      </div>
      <pre style={{background:'#111', color:'#0f0', padding:12, marginTop:12, maxHeight:300, overflow:'auto'}}>
        {logs.join('\n')}
      </pre>
    </div>
  )
}
