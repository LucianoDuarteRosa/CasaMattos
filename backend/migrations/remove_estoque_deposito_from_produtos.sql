-- Remove os campos estoque e deposito da tabela produtos
-- Agora eles serão calculados dinamicamente
ALTER TABLE "Produtos"
DROP COLUMN IF EXISTS estoque,
DROP COLUMN IF EXISTS deposito;