"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("./infrastructure/database/connection"));
// Importar modelos na ordem de dependências (sem referências primeiro)
require("./infrastructure/database/models/PerfilModel");
require("./infrastructure/database/models/RuaModel");
require("./infrastructure/database/models/FornecedorModel");
// Depois modelos que referenciam os anteriores
require("./infrastructure/database/models/PredioModel");
require("./infrastructure/database/models/ProdutoModel");
require("./infrastructure/database/models/UsuarioModel");
require("./infrastructure/database/models/ListaModel");
require("./infrastructure/database/models/EnderecamentoModel");
async function syncDatabase() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await connection_1.default.authenticate();
        console.log('✅ Conexão estabelecida com sucesso!');
        console.log('🔄 Sincronizando modelos...');
        // force: true - Apaga e recria as tabelas (CUIDADO: perde dados)
        // alter: true - Modifica as tabelas existentes para coincidir com os modelos
        // Se não especificar, apenas cria tabelas que não existem
        await connection_1.default.sync({
            force: false, // Mude para true se quiser recriar todas as tabelas
            alter: true // Modifica tabelas existentes
        });
        console.log('✅ Tabelas sincronizadas com sucesso!');
        // Listar todas as tabelas criadas
        const tables = await connection_1.default.getQueryInterface().showAllTables();
        console.log('📋 Tabelas no banco:', tables);
    }
    catch (error) {
        console.error('❌ Erro ao sincronizar banco:', error);
    }
    finally {
        await connection_1.default.close();
        console.log('🔌 Conexão fechada.');
    }
}
syncDatabase();
//# sourceMappingURL=database-sync.js.map