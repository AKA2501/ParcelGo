import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="hero-badge">On-demand & scheduled</div>
            <h1 className="hero-title">
              Deliver anything, <span className="accent">anywhere</span>, fast.
            </h1>
            <p className="hero-sub">
              ParcelGo is your microservices-powered courier platform. Create
              orders, manage users, and (soon) track couriers in real-time—all
              behind a Spring Cloud Gateway and a clean React UI.
            </p>

            <div className="hero-actions">
              <Link to="/orders/new" className="btn primary lg">
                Create Order
              </Link>
              <Link to="/orders" className="btn lg">
                View Orders
              </Link>
              <Link to="/users" className="btn ghost lg">
                Manage Users
              </Link>
              <Link to="/drivers/new" className="btn lg">
                Register Driver
              </Link>
              <Link to="/orders" className="btn lg">
                View Orders
              </Link>
            </div>

            <ul className="hero-pills">
              <li>✅ Rate-limited API Gateway</li>
              <li>✅ Postgres + Flyway migrations</li>
              <li>✅ Ready for Keycloak OIDC</li>
            </ul>
          </div>

          <div className="hero-illus">
            <div className="card hero-card">
              <div className="hero-card-row">
                <span className="hero-emoji">📦</span>
                <div>
                  <div className="muted">Package</div>
                  <div className="strong">1 × Medium Box</div>
                </div>
              </div>
              <div className="hero-card-row">
                <span className="hero-emoji">🧭</span>
                <div>
                  <div className="muted">Route</div>
                  <div className="strong">Connaught Pl → Gurugram</div>
                </div>
              </div>
              <div className="hero-card-row">
                <span className="hero-emoji">⚡</span>
                <div>
                  <div className="muted">Mode</div>
                  <div className="strong">ON_DEMAND</div>
                </div>
              </div>
              <div className="hero-card-footer">
                <span className="pill">ETA ~ 45 min</span>
                <span className="pill pill-green">Live soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Why ParcelGo?</h2>
          <div className="feature-grid">
            <div className="feature-card card">
              <div className="feature-icon">⚙️</div>
              <h3>Production-ready backend</h3>
              <p>
                Spring Boot microservices with clean boundaries: users, orders,
                pricing, tracking, and more—fronted by Spring Cloud Gateway.
              </p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🧭</div>
              <h3>On-demand & scheduled</h3>
              <p>
                Create instant deliveries or schedule for later. Add pickup and
                dropoff details, item dimensions, and declared value.
              </p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🔐</div>
              <h3>Auth-ready</h3>
              <p>
                Built to plug into Keycloak OIDC. Once enabled, the UI will use
                tokens automatically via the Axios wrapper.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <ol className="steps">
            <li className="step">
              <span className="step-num">1</span>
              <h4>Create order</h4>
              <p>Provide pickup, dropoff, and package details.</p>
            </li>
            <li className="step">
              <span className="step-num">2</span>
              <h4>Pricing & assignment</h4>
              <p>Pricing/dispatch services (coming next) do the magic.</p>
            </li>
            <li className="step">
              <span className="step-num">3</span>
              <h4>Track & deliver</h4>
              <p>Track (websocket) and notify until the parcel is delivered.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats">
        <div className="container stats-inner">
          <div className="stat">
            <div className="stat-value">8080</div>
            <div className="stat-label">Gateway Port</div>
          </div>
          <div className="stat">
            <div className="stat-value">8101–8109</div>
            <div className="stat-label">Service Ports</div>
          </div>
          <div className="stat">
            <div className="stat-value">5432</div>
            <div className="stat-label">Postgres</div>
          </div>
          <div className="stat">
            <div className="stat-value">Redis</div>
            <div className="stat-label">Rate limiting</div>
          </div>
        </div>
      </section>
    </div>
  );
}
