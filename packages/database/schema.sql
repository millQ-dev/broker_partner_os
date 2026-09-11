CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  broker TEXT NOT NULL,
  base_currency CHAR(3) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cash_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  currency CHAR(3) NOT NULL,
  amount NUMERIC(24, 8) NOT NULL,
  as_of TIMESTAMPTZ NOT NULL,
  UNIQUE (account_id, currency, as_of)
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  instrument_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'BUY', 'SELL', 'DIVIDEND', 'FEE')),
  quantity NUMERIC(28, 10),
  price NUMERIC(24, 8),
  amount NUMERIC(24, 8),
  fees NUMERIC(24, 8) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (type IN ('BUY', 'SELL') AND instrument_id IS NOT NULL AND quantity > 0 AND price >= 0)
    OR
    (type NOT IN ('BUY', 'SELL'))
  )
);

CREATE INDEX IF NOT EXISTS transactions_account_time_idx
  ON transactions(account_id, executed_at);
CREATE INDEX IF NOT EXISTS transactions_instrument_time_idx
  ON transactions(instrument_id, executed_at)
  WHERE instrument_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS investment_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  status TEXT NOT NULL CHECK (status IN ('WATCH', 'RESEARCH', 'PROPOSED', 'APPROVED', 'OPEN', 'EXITED', 'REJECTED')),
  thesis TEXT NOT NULL DEFAULT '',
  catalysts JSONB NOT NULL DEFAULT '[]'::jsonb,
  horizon TEXT NOT NULL DEFAULT '',
  entry_plan TEXT NOT NULL DEFAULT '',
  target_plan TEXT NOT NULL DEFAULT '',
  invalidation TEXT NOT NULL DEFAULT '',
  confidence NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'SPECULATIVE')),
  proposed_size_pct NUMERIC(6, 3) NOT NULL DEFAULT 0 CHECK (proposed_size_pct BETWEEN 0 AND 100),
  max_loss_pct NUMERIC(6, 3) NOT NULL DEFAULT 0 CHECK (max_loss_pct BETWEEN 0 AND 100),
  manual_approval_required BOOLEAN NOT NULL DEFAULT false,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  approval_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investment_idea_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_idea_id UUID NOT NULL REFERENCES investment_ideas(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS investment_idea_events_idea_time_idx
  ON investment_idea_events(investment_idea_id, occurred_at);

CREATE TABLE IF NOT EXISTS position_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  instrument_id TEXT NOT NULL,
  quantity NUMERIC(28, 10) NOT NULL,
  average_cost NUMERIC(24, 8) NOT NULL,
  realized_pnl NUMERIC(24, 8) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL,
  as_of TIMESTAMPTZ NOT NULL,
  UNIQUE (account_id, instrument_id, as_of)
);
