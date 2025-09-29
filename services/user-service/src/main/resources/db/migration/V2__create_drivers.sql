CREATE TABLE IF NOT EXISTS drivers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(40),

  vehicle_registration VARCHAR(40),
  max_weight_kg INTEGER,

  start_line1 VARCHAR(120),
  start_line2 VARCHAR(120),
  start_city  VARCHAR(80),
  start_state VARCHAR(80),
  start_postal VARCHAR(20),
  start_country VARCHAR(80),
  start_lat DOUBLE PRECISION,
  start_lng DOUBLE PRECISION,

  end_line1 VARCHAR(120),
  end_line2 VARCHAR(120),
  end_city  VARCHAR(80),
  end_state VARCHAR(80),
  end_postal VARCHAR(20),
  end_country VARCHAR(80),
  end_lat DOUBLE PRECISION,
  end_lng DOUBLE PRECISION,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_driver_email ON drivers(email);
