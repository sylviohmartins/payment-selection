-- Script de inicialização do banco de dados
-- Payment Selection Backend - PostgreSQL Init

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configurar timezone
SET timezone = 'UTC';

-- Criar schema se não existir
CREATE SCHEMA IF NOT EXISTS payment_selection;

-- Configurar search_path
ALTER DATABASE payment_selection_db SET search_path TO payment_selection, public;

-- Tabela compatível com a entidade @Table(name="payment")
CREATE TABLE IF NOT EXISTS payment_selection.payment (
  id           BIGSERIAL PRIMARY KEY,
  status       VARCHAR(32) NOT NULL DEFAULT 'A_PAGAR',
  vencimento   DATE,
  valor        NUMERIC(10,2),
  descricao    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION payment_selection.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_updated_at ON payment_selection.payment;
CREATE TRIGGER trg_payment_updated_at
BEFORE UPDATE ON payment_selection.payment
FOR EACH ROW EXECUTE FUNCTION payment_selection.touch_updated_at();

-- Seeds somente se a tabela estiver vazia
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM payment_selection.payment) THEN
    INSERT INTO payment_selection.payment (status, vencimento, valor, descricao) VALUES
      ('A_PAGAR', '2024-12-01', 120.50, 'Conta de luz'),
      ('A_PAGAR', '2025-01-15',  99.90,  'Internet'),
      ('PAGO',    '2024-11-10',  80.00,  'Água');
  END IF;
END$$;

-- Criar usuário de aplicação com permissões limitadas (se necessário)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
--         CREATE ROLE app_user LOGIN PASSWORD 'app_password';
--         GRANT CONNECT ON DATABASE payment_selection_db TO app_user;
--         GRANT USAGE ON SCHEMA payment_selection TO app_user;
--         GRANT CREATE ON SCHEMA payment_selection TO app_user;
--     END IF;
-- END
-- $$;

-- Configurações de performance para a sessão
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Recarregar configurações
SELECT pg_reload_conf();

-- Log de inicialização
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;

-- Comentário de finalização
COMMENT ON DATABASE payment_selection_db IS 'Database for Payment Selection Backend - Initialized on ' || NOW();

