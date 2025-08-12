import sequelize from './infrastructure/database/connection';
import PerfilModel from './infrastructure/database/models/PerfilModel';
import RuaModel from './infrastructure/database/models/RuaModel';
import FornecedorModel from './infrastructure/database/models/FornecedorModel';
import PredioModel from './infrastructure/database/models/PredioModel';
import bcrypt from 'bcryptjs';
import UsuarioModel from './infrastructure/database/models/UsuarioModel';

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed do banco de dados...');
        await sequelize.authenticate();

        // Inserir perfis básicos
        const perfilAdmin = await PerfilModel.findOrCreate({
            where: { nomePerfil: 'Administrador' },
            defaults: { nomePerfil: 'Administrador' }
        });

        const perfilOperador = await PerfilModel.findOrCreate({
            where: { nomePerfil: 'Operador' },
            defaults: { nomePerfil: 'Operador' }
        });

        console.log('✅ Perfis criados/verificados');

        // Inserir ruas básicas
        const rua1 = await RuaModel.findOrCreate({
            where: { nomeRua: 'Rua A' },
            defaults: { nomeRua: 'Rua A' }
        });

        const rua2 = await RuaModel.findOrCreate({
            where: { nomeRua: 'Rua B' },
            defaults: { nomeRua: 'Rua B' }
        });

        console.log('✅ Ruas criadas/verificadas');

        // Inserir prédios básicos
        await PredioModel.findOrCreate({
            where: { nomePredio: 'Prédio 1', idRua: rua1[0].id },
            defaults: { nomePredio: 'Prédio 1', idRua: rua1[0].id, vagas: 100 }
        });

        await PredioModel.findOrCreate({
            where: { nomePredio: 'Prédio 2', idRua: rua2[0].id },
            defaults: { nomePredio: 'Prédio 2', idRua: rua2[0].id, vagas: 150 }
        });

        console.log('✅ Prédios criados/verificados');

        // Inserir fornecedor básico
        await FornecedorModel.findOrCreate({
            where: { cnpj: '12.345.678/0001-99' },
            defaults: {
                razaoSocial: 'Fornecedor Exemplo LTDA',
                cnpj: '12.345.678/0001-99'
            }
        });

        console.log('✅ Fornecedores criados/verificados');

        // Criar usuário administrador padrão
        const senhaHash = await bcrypt.hash('admin123', 10);

        await UsuarioModel.findOrCreate({
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

    } catch (error) {
        console.error('❌ Erro ao popular banco:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Conexão fechada.');
    }
}

seedDatabase();
