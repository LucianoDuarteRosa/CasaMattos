-- Drop da tabela estoque_items e recriação no padrão EstoqueItems
DROP TABLE IF EXISTS estoque_items;

-- Criação da tabela EstoqueItems no padrão correto
CREATE TABLE IF NOT EXISTS "EstoqueItems" (
    id SERIAL PRIMARY KEY,
    "produtoId" INTEGER NOT NULL,
    lote VARCHAR(100) NOT NULL,
    ton VARCHAR(100) NOT NULL,
    bit VARCHAR(100) NOT NULL,
    quantidade DECIMAL(10, 3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produto FOREIGN KEY ("produtoId") REFERENCES "Produtos" (id) ON DELETE CASCADE,
    CONSTRAINT unique_produto_caracteristicas UNIQUE ("produtoId", lote, ton, bit)
);

-- Criar índice para consultas por produto
CREATE INDEX IF NOT EXISTS idx_estoque_items_produto ON "EstoqueItems" ("produtoId");