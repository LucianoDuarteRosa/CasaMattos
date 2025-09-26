import sequelize from './infrastructure/database/connection';
import PerfilModel from './infrastructure/database/models/PerfilModel';
import RuaModel from './infrastructure/database/models/RuaModel';
import FornecedorModel from './infrastructure/database/models/FornecedorModel';
import PredioModel from './infrastructure/database/models/PredioModel';
import ProdutoModel from './infrastructure/database/models/ProdutoModel';
import UsuarioModel from './infrastructure/database/models/UsuarioModel';
import ListaModel from './infrastructure/database/models/ListaModel';
import EnderecamentoModel from './infrastructure/database/models/EnderecamentoModel';

async function checkDatabase() {
    try {
        console.log('🔍 Verificando status do banco de dados...');
        await sequelize.authenticate();
        console.log('✅ Conexão estabelecida com sucesso!');

        // Verificar cada tabela
        const tables = [
            { name: 'Perfis', model: PerfilModel },
            { name: 'Ruas', model: RuaModel },
            { name: 'Fornecedores', model: FornecedorModel },
            { name: 'Predios', model: PredioModel },
            { name: 'Produtos', model: ProdutoModel },
            { name: 'Usuarios', model: UsuarioModel },
            { name: 'Listas', model: ListaModel },
            { name: 'Enderecamentos', model: EnderecamentoModel }
        ];

        console.log('\n📊 Status das tabelas:');

        for (const table of tables) {
            try {
                const count = await (table.model as any).count();
                console.log(`   ✅ ${table.name}: ${count} registros`);
            } catch (error) {
                console.log(`   ❌ ${table.name}: Erro ao acessar`);
            }
        }

        // Mostrar informações do usuário admin
        const admin = await UsuarioModel.findOne({ where: { email: 'admin@admin.com' } });
        if (admin) {
            console.log('\n👤 Usuário administrador:');
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   👨‍💼 Nome: ${admin.nomeCompleto}`);
            console.log(`   🔑 Senha: admin123`);
            console.log(`   🟢 Status: ${admin.ativo ? 'Ativo' : 'Inativo'}`);
        }

        console.log('\n🎯 Para iniciar o servidor:');
        console.log('   npm run dev');

    } catch (error) {
        console.error('❌ Erro ao verificar banco:', error);
    } finally {
        await sequelize.close();
        console.log('\n🔌 Conexão fechada.');
    }
}

checkDatabase();
