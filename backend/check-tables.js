const { Client } = require('pg');

async function checkTables() {
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

        // Listar todas as tabelas
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        console.log('Tabelas existentes:');
        result.rows.forEach(row => {
            console.log('- ' + row.table_name);
        });

        // Verificar se existe alguma tabela relacionada a usuários
        const userTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND LOWER(table_name) LIKE '%usuario%'
            ORDER BY table_name
        `);

        console.log('\nTabelas relacionadas a usuários:');
        userTables.rows.forEach(row => {
            console.log('- ' + row.table_name);
        });

        // Se encontrar uma tabela de usuários, mostrar suas colunas
        if (userTables.rows.length > 0) {
            const tableName = userTables.rows[0].table_name;
            console.log(`\nColunas da tabela ${tableName}:`);

            const columns = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [tableName]);

            columns.rows.forEach(col => {
                console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
            });
        }

    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        await client.end();
        console.log('\nConexão fechada');
    }
}

checkTables();
