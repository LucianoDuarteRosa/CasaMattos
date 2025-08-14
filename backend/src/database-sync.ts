import sequelize from './infrastructure/database/connection';
// Importar modelos na ordem de dependências (sem referências primeiro)
import './infrastructure/database/models/PerfilModel';
import './infrastructure/database/models/RuaModel';
import './infrastructure/database/models/FornecedorModel';
// Depois modelos que referenciam os anteriores
import './infrastructure/database/models/PredioModel';
import './infrastructure/database/models/ProdutoModel';
import './infrastructure/database/models/UsuarioModel';
import './infrastructure/database/models/ListaModel';
import './infrastructure/database/models/EnderecamentoModel';
import './infrastructure/database/models/LogModel';

async function syncDatabase() {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await sequelize.authenticate();
        console.log('✅ Conexão estabelecida com sucesso!');

        console.log('🔄 Sincronizando modelos...');

        // force: true - Apaga e recria as tabelas (CUIDADO: perde dados)
        // alter: true - Modifica as tabelas existentes para coincidir com os modelos
        // Se não especificar, apenas cria tabelas que não existem
        await sequelize.sync({
            force: false,  // Mude para true se quiser recriar todas as tabelas
            alter: true    // Modifica tabelas existentes
        });

        console.log('✅ Tabelas sincronizadas com sucesso!');

        // Listar todas as tabelas criadas
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('📋 Tabelas no banco:', tables);

    } catch (error) {
        console.error('❌ Erro ao sincronizar banco:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Conexão fechada.');
    }
}

syncDatabase();
