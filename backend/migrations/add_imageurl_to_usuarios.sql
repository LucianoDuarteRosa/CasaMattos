-- Adicionando campo imagemUrl à tabela Usuarios
ALTER TABLE Usuarios ADD COLUMN imagemUrl VARCHAR(500) DEFAULT NULL;

-- Comentários
COMMENT ON COLUMN Usuarios.imagemUrl IS 'URL da imagem de perfil do usuário';