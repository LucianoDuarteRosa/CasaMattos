-- Criação da tabela estoque_items para controle detalhado de estoque por lote/ton/bit
CREATE TABLE IF NOT EXISTS estoque_items (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL,
    lote VARCHAR(100) NOT NULL,
    ton VARCHAR(100) NOT NULL,
    bit VARCHAR(100) NOT NULL,
    quantidade DECIMAL(10, 3) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produto FOREIGN KEY (produto_id) REFERENCES "Produtos" (id) ON DELETE CASCADE,
    CONSTRAINT unique_produto_caracteristicas UNIQUE (produto_id, lote, ton, bit)
);

-- Criar índice para consultas por produto
CREATE INDEX IF NOT EXISTS idx_estoque_items_produto ON estoque_items (produto_id);