"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("./infrastructure/database/connection"));
const PerfilModel_1 = __importDefault(require("./infrastructure/database/models/PerfilModel"));
const RuaModel_1 = __importDefault(require("./infrastructure/database/models/RuaModel"));
const FornecedorModel_1 = __importDefault(require("./infrastructure/database/models/FornecedorModel"));
const PredioModel_1 = __importDefault(require("./infrastructure/database/models/PredioModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UsuarioModel_1 = __importDefault(require("./infrastructure/database/models/UsuarioModel"));
async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed do banco de dados...');
        await connection_1.default.authenticate();
        // Inserir perfis básicos
        const perfilAdmin = await PerfilModel_1.default.findOrCreate({
            where: { nomePerfil: 'Administrador' },
            defaults: { nomePerfil: 'Administrador' }
        });
        const perfilOperador = await PerfilModel_1.default.findOrCreate({
            where: { nomePerfil: 'Operador' },
            defaults: { nomePerfil: 'Operador' }
        });
        console.log('✅ Perfis criados/verificados');
        // Inserir ruas básicas
        const rua1 = await RuaModel_1.default.findOrCreate({
            where: { nomeRua: 'Rua A' },
            defaults: { nomeRua: 'Rua A' }
        });
        const rua2 = await RuaModel_1.default.findOrCreate({
            where: { nomeRua: 'Rua B' },
            defaults: { nomeRua: 'Rua B' }
        });
        console.log('✅ Ruas criadas/verificadas');
        // Inserir prédios básicos
        await PredioModel_1.default.findOrCreate({
            where: { nomePredio: 'Prédio 1', idRua: rua1[0].id },
            defaults: { nomePredio: 'Prédio 1', idRua: rua1[0].id, vagas: 100 }
        });
        await PredioModel_1.default.findOrCreate({
            where: { nomePredio: 'Prédio 2', idRua: rua2[0].id },
            defaults: { nomePredio: 'Prédio 2', idRua: rua2[0].id, vagas: 150 }
        });
        console.log('✅ Prédios criados/verificados');
        // Inserir fornecedor básico
        await FornecedorModel_1.default.findOrCreate({
            where: { cnpj: '12.345.678/0001-99' },
            defaults: {
                razaoSocial: 'Fornecedor Exemplo LTDA',
                cnpj: '12.345.678/0001-99'
            }
        });
        console.log('✅ Fornecedores criados/verificados');
        // Criar usuário administrador padrão
        const senhaHash = await bcryptjs_1.default.hash('admin123', 10);
        await UsuarioModel_1.default.findOrCreate({
            where: { email: 'admin@casamattos.com' },
            defaults: {
                nomeCompleto: 'Administrador Sistema',
                nickname: 'admin',
                email: 'admin@casamattos.com',
                telefone: '(11) 99999-9999',
                senha: senhaHash,
                ativo: true,
                idPerfil: perfilAdmin[0].id
            }
        });
        console.log('✅ Usuário administrador criado/verificado');
        console.log('📋 Dados iniciais inseridos:');
        console.log('   - Email: admin@casamattos.com');
        console.log('   - Senha: admin123');
    }
    catch (error) {
        console.error('❌ Erro ao popular banco:', error);
    }
    finally {
        await connection_1.default.close();
        console.log('🔌 Conexão fechada.');
    }
}
seedDatabase();
//# sourceMappingURL=database-seed.js.map