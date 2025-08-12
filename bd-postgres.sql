-- Criação do banco de dados PostgreSQL para Casa Mattos

-- Criação das tabelas

CREATE TABLE Fornecedores (
    id SERIAL PRIMARY KEY,
    razaoSocial VARCHAR(60) NOT NULL,
    cnpj VARCHAR(60) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Produtos (
    id SERIAL PRIMARY KEY,
    codInterno INTEGER NOT NULL UNIQUE,
    descricao VARCHAR(100) NOT NULL,
    quantMinVenda DOUBLE PRECISION NOT NULL,
    codBarras VARCHAR(30),
    deposito DOUBLE PRECISION NOT NULL,
    estoque DOUBLE PRECISION NOT NULL,
    custo DOUBLE PRECISION,
    codFabricante VARCHAR(60),
    quantCaixas INTEGER,
    idFornecedor INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idFornecedor) REFERENCES Fornecedores (id) ON DELETE RESTRICT
);

CREATE TABLE Ruas (
    id SERIAL PRIMARY KEY,
    nomeRua VARCHAR(60) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Predios (
    id SERIAL PRIMARY KEY,
    nomePredio VARCHAR(60) NOT NULL,
    vagas INTEGER,
    idRua INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idRua) REFERENCES Ruas (id) ON DELETE RESTRICT
);

CREATE TABLE Listas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(20) NOT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Enderecamentos (
    id SERIAL PRIMARY KEY,
    tonalidade VARCHAR(10) NOT NULL,
    bitola VARCHAR(10) NOT NULL,
    lote VARCHAR(30),
    observacao VARCHAR(60),
    quantCaixas INTEGER,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    idProduto INTEGER NOT NULL,
    idLista INTEGER,
    idPredio INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProduto) REFERENCES Produtos (id) ON DELETE RESTRICT,
    FOREIGN KEY (idLista) REFERENCES Listas (id) ON DELETE SET NULL,
    FOREIGN KEY (idPredio) REFERENCES Predios (id) ON DELETE RESTRICT
);

CREATE TABLE Perfis (
    id SERIAL PRIMARY KEY,
    nomePerfil VARCHAR(60) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY,
    nomeCompleto VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    senha VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    idPerfil INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPerfil) REFERENCES Perfis (id) ON DELETE RESTRICT
);

CREATE TABLE Logs (
    id SERIAL PRIMARY KEY,
    idUsuario INTEGER NOT NULL,
    entidade VARCHAR(20) NOT NULL,
    acao VARCHAR(20) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    dataHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES Usuarios (id) ON DELETE RESTRICT
);

-- Criação de índices para melhor performance
CREATE INDEX idx_produtos_codintern ON Produtos (codInterno);

CREATE INDEX idx_produtos_fornecedor ON Produtos (idFornecedor);

CREATE INDEX idx_enderecamentos_produto ON Enderecamentos (idProduto);

CREATE INDEX idx_enderecamentos_lista ON Enderecamentos (idLista);

CREATE INDEX idx_enderecamentos_predio ON Enderecamentos (idPredio);

CREATE INDEX idx_usuarios_email ON Usuarios (email);

CREATE INDEX idx_logs_usuario ON Logs (idUsuario);

CREATE INDEX idx_logs_datahora ON Logs (dataHora);

-- Inserção de dados iniciais
INSERT INTO
    Perfis (nomePerfil)
VALUES ('Administrador'),
    ('Gerente'),
    ('Operador');

INSERT INTO
    Usuarios (
        nomeCompleto,
        nickname,
        email,
        senha,
        ativo,
        idPerfil
    )
VALUES (
        'Administrador do Sistema',
        'admin',
        'admin@casamattos.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        true,
        1
    );
-- Senha padrão: password

INSERT INTO
    Fornecedores (razaoSocial, cnpj)
VALUES (
        'Fornecedor Exemplo LTDA',
        '12.345.678/0001-90'
    ),
    (
        'Materiais Casa Mattos LTDA',
        '98.765.432/0001-10'
    );

INSERT INTO Ruas (nomeRua) VALUES ('Rua A'), ('Rua B'), ('Rua C');

INSERT INTO
    Predios (nomePredio, vagas, idRua)
VALUES ('Prédio 1', 100, 1),
    ('Prédio 2', 150, 1),
    ('Prédio 3', 80, 2);

-- Comentários nas tabelas
COMMENT ON
TABLE Fornecedores IS 'Tabela de fornecedores de produtos';

COMMENT ON TABLE Produtos IS 'Tabela de produtos do estoque';

COMMENT ON TABLE Ruas IS 'Tabela de ruas do depósito';

COMMENT ON TABLE Predios IS 'Tabela de prédios do depósito';

COMMENT ON TABLE Listas IS 'Tabela de listas de separação';

COMMENT ON
TABLE Enderecamentos IS 'Tabela de endereçamentos dos produtos';

COMMENT ON TABLE Perfis IS 'Tabela de perfis de usuários';

COMMENT ON TABLE Usuarios IS 'Tabela de usuários do sistema';

COMMENT ON TABLE Logs IS 'Tabela de logs de auditoria';