const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'admin',
        database: process.env.DB_NAME || 'CMDatabase',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();
        console.log('Conectado ao banco de dados');

        // Ler o arquivo de migração
        const migrationPath = path.join(__dirname, 'migrations', 'add_imageurl_to_usuarios.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executando migração...');
        console.log('SQL:', migrationSQL);

        // Executar a migração
        await client.query(migrationSQL);

        console.log('Migração executada com sucesso!');

        // Verificar se a coluna foi adicionada
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'Usuarios' AND column_name = 'imagemUrl'
        `);

        if (result.rows.length > 0) {
            console.log('Coluna imagemUrl adicionada com sucesso:');
            console.log(result.rows[0]);
        } else {
            console.log('Erro: Coluna imagemUrl não foi encontrada após a migração');
        }

    } catch (error) {
        console.error('Erro ao executar migração:', error.message);

        // Se o erro for que a coluna já existe, isso é ok
        if (error.message.includes('already exists')) {
            console.log('A coluna imagemUrl já existe na tabela');
        }
    } finally {
        await client.end();
        console.log('Conexão fechada');
    }
}

runMigration();
