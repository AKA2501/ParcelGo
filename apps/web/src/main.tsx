// apps/web/src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'

import Home from './pages/Home'
import CreateUser from './pages/users/CreateUser'
import UsersList from './pages/users/UsersList'
import CreateDriver from './pages/drivers/CreateDriver'   // already present
import DriversList from './pages/drivers/DriversList';
import OrdersList from './pages/orders/OrdersList'
import OrderNew from './pages/orders/OrderNew'

import './styles.css'

function Nav(){
  const loc = useLocation()
  const is = (path: string) =>
    loc.pathname === '/' ? path === '/' : loc.pathname.startsWith(path)

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand">
          <span className="logo">📦</span>
          <span>ParcelGo</span>
        </div>
        <nav className="nav-links">
          <Link className={is('/') ? 'active' : ''} to="/">Home</Link>

          {/* mark active for orders */}
          <Link className={is('/orders') ? 'active' : ''} to="/orders">Orders</Link>
          <Link className={is('/orders/new') ? 'active' : ''} to="/orders/new">New Order</Link>

          <div className="divider" />
          <Link className={is('/users') ? 'active' : ''} to="/users">Users</Link>
          <Link className={is('/users/new') ? 'active' : ''} to="/users/new">New User</Link>

          <div className="divider" />
          {/* Drivers */}
          <Link className={is('/drivers') ? 'active' : ''} to="/drivers">Drivers</Link>
          <Link className={is('/drivers/new') ? 'active' : ''} to="/drivers/new">New Driver</Link>
        </nav>
      </div>
    </header>
  )
}

function Shell({ children }: { children: React.ReactNode }){
  return (
    <div>
      <Nav />
      <main className="container" style={{ paddingTop: 24 }}>{children}</main>
    </div>
  )
}

function AppRoutes(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell><Home/></Shell>} />

        {/* Orders wrapped with Shell so nav styling applies */}
        <Route path="/orders" element={<Shell><OrdersList/></Shell>} />
        <Route path="/orders/new" element={<Shell><OrderNew/></Shell>} />

        {/* Users */}
        <Route path="/users" element={<Shell><UsersList/></Shell>} />
        <Route path="/users/new" element={<Shell><CreateUser/></Shell>} />

        {/* Drivers */}
        <Route path="/drivers" element={<Shell><DriversList/></Shell>} />
        <Route path="/drivers/new" element={<Shell><CreateDriver/></Shell>} />

        <Route path="*" element={<Shell><h2>Not found</h2></Shell>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(<AppRoutes/>)
