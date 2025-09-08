-- Tabela de seleções
CREATE TABLE IF NOT EXISTS selection (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('ALL', 'NONE')),
    filter_json JSONB NOT NULL,
    include_ids JSONB DEFAULT '[]'::JSONB,
    exclude_ids JSONB DEFAULT '[]'::JSONB,
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Índice para acelerar buscas pela seleção
CREATE INDEX IF NOT EXISTS idx_selection_user_id ON selection (user_id);

-- Tabela de pagamentos (exemplo)
CREATE TABLE IF NOT EXISTS payment (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'A_PAGAR',
    vencimento DATE,
    valor DECIMAL(10,2),
    descricao VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para acelerar consultas por status e vencimento
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment (status);
CREATE INDEX IF NOT EXISTS idx_payment_vencimento ON payment (vencimento);

-- Inserir alguns dados de exemplo para testes
INSERT INTO payment (status, vencimento, valor, descricao) VALUES
('A_PAGAR', '2024-01-15', 100.00, 'Pagamento 1'),
('A_PAGAR', '2024-01-20', 200.00, 'Pagamento 2'),
('A_PAGAR', '2024-01-25', 150.00, 'Pagamento 3'),
('A_PAGAR', '2024-02-01', 300.00, 'Pagamento 4'),
('A_PAGAR', '2024-02-05', 250.00, 'Pagamento 5'),
('PAID', '2024-01-10', 180.00, 'Pagamento 6'),
('PAID', '2024-01-12', 220.00, 'Pagamento 7'),
('A_PAGAR', '2024-02-10', 400.00, 'Pagamento 8'),
('A_PAGAR', '2024-02-15', 350.00, 'Pagamento 9'),
('A_PAGAR', '2024-02-20', 500.00, 'Pagamento 10')
ON CONFLICT DO NOTHING;

