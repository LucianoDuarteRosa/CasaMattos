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
const ProdutoModel_1 = __importDefault(require("./infrastructure/database/models/ProdutoModel"));
const UsuarioModel_1 = __importDefault(require("./infrastructure/database/models/UsuarioModel"));
const ListaModel_1 = __importDefault(require("./infrastructure/database/models/ListaModel"));
const EnderecamentoModel_1 = __importDefault(require("./infrastructure/database/models/EnderecamentoModel"));
async function checkDatabase() {
    try {
        console.log('🔍 Verificando status do banco de dados...');
        await connection_1.default.authenticate();
        console.log('✅ Conexão estabelecida com sucesso!');
        // Verificar cada tabela
        const tables = [
            { name: 'Perfis', model: PerfilModel_1.default },
            { name: 'Ruas', model: RuaModel_1.default },
            { name: 'Fornecedores', model: FornecedorModel_1.default },
            { name: 'Predios', model: PredioModel_1.default },
            { name: 'Produtos', model: ProdutoModel_1.default },
            { name: 'Usuarios', model: UsuarioModel_1.default },
            { name: 'Listas', model: ListaModel_1.default },
            { name: 'Enderecamentos', model: EnderecamentoModel_1.default }
        ];
        console.log('\n📊 Status das tabelas:');
        for (const table of tables) {
            try {
                const count = await table.model.count();
                console.log(`   ✅ ${table.name}: ${count} registros`);
            }
            catch (error) {
                console.log(`   ❌ ${table.name}: Erro ao acessar`);
            }
        }
        // Mostrar informações do usuário admin
        const admin = await UsuarioModel_1.default.findOne({ where: { email: 'admin@casamattos.com' } });
        if (admin) {
            console.log('\n👤 Usuário administrador:');
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   👨‍💼 Nome: ${admin.nomeCompleto}`);
            console.log(`   🔑 Senha: admin123`);
            console.log(`   🟢 Status: ${admin.ativo ? 'Ativo' : 'Inativo'}`);
        }
        console.log('\n🎯 Para iniciar o servidor:');
        console.log('   npm run dev');
    }
    catch (error) {
        console.error('❌ Erro ao verificar banco:', error);
    }
    finally {
        await connection_1.default.close();
        console.log('\n🔌 Conexão fechada.');
    }
}
checkDatabase();
//# sourceMappingURL=database-check.js.map