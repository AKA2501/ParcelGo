-- Fresh V1 schema for orders service

CREATE TABLE orders (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT      NOT NULL,
  status           VARCHAR(32) NOT NULL DEFAULT 'CREATED',

  -- fulfillment
  mode             VARCHAR(16) NOT NULL DEFAULT 'ON_DEMAND',  -- ON_DEMAND|SCHEDULED
  scheduled_at     TIMESTAMP NULL,
  vehicle_type     VARCHAR(16),

  -- pickup (denormalized)
  pickup_name      VARCHAR(120),
  pickup_phone     VARCHAR(32),
  pickup_addr1     VARCHAR(180) NOT NULL,
  pickup_addr2     VARCHAR(180),
  pickup_city      VARCHAR(80),
  pickup_state     VARCHAR(80),
  pickup_postal    VARCHAR(32),
  pickup_lat       NUMERIC(9,6),
  pickup_lng       NUMERIC(9,6),

  -- dropoff
  drop_name        VARCHAR(120),
  drop_phone       VARCHAR(32),
  drop_addr1       VARCHAR(180) NOT NULL,
  drop_addr2       VARCHAR(180),
  drop_city        VARCHAR(80),
  drop_state       VARCHAR(80),
  drop_postal      VARCHAR(32),
  drop_lat         NUMERIC(9,6),
  drop_lng         NUMERIC(9,6),

  -- package
  pkg_description  VARCHAR(255),
  pkg_weight_kg    NUMERIC(10,2),
  pkg_length_cm    NUMERIC(10,2),
  pkg_width_cm     NUMERIC(10,2),
  pkg_height_cm    NUMERIC(10,2),
  declared_value   NUMERIC(12,2),

  -- amounts / payment hooks
  currency         VARCHAR(3)   DEFAULT 'INR',
  quoted_amount    NUMERIC(12,2),
  final_amount     NUMERIC(12,2),
  payment_method   VARCHAR(16),               -- cod|wallet|card
  payment_intent_id VARCHAR(100),
  promo_code       VARCHAR(64),

  -- assignment snapshot
  courier_id       BIGINT,
  vehicle_plate    VARCHAR(20),
  eta_minutes      INT,

  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_status_history (
  id        BIGSERIAL PRIMARY KEY,
  order_id  BIGINT NOT NULL,
  status    VARCHAR(32) NOT NULL,
  note      VARCHAR(255),
  actor     VARCHAR(32),
  actor_id  BIGINT,
  at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id     ON orders(user_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created_at  ON orders(created_at);
CREATE INDEX idx_orders_scheduled   ON orders(scheduled_at);
CREATE INDEX idx_orders_courier_id  ON orders(courier_id);
