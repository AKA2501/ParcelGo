-- Fresh baseline for users table with all required columns
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  address_line1 VARCHAR(120),
  address_line2 VARCHAR(120),
  city VARCHAR(80),
  state VARCHAR(80),
  postal_code VARCHAR(20),
  country VARCHAR(80),
  home_lat NUMERIC(9,6),
  home_lng NUMERIC(9,6),
  default_payment_method VARCHAR(50),
  wallet_balance NUMERIC(12,2) DEFAULT 0,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_doc_key VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes (id PK + unique email/phone already defined above)
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);

-- Trigger to auto-maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        