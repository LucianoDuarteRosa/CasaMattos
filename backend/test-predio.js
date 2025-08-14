const { Sequelize } = require('sequelize');
const config = require('./config/database.js');

const dbConfig = config.development;
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: false
});

async function testPredioData() {
  try {
    await sequelize.authenticate();
    
    const query = `
      SELECT p.id, p."nomePredio", r."nomeRua"
      FROM "Predios" p
      LEFT JOIN "Ruas" r ON p."idRua" = r.id
      LIMIT 5
    `;
    
    const [results] = await sequelize.query(query);
    
    console.log('Resultado da consulta direta:');
    results.forEach(row => {
      console.log(`ID: ${row.id}, Predio: ${row.nomePredio}, Rua: ${row.nomeRua || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await sequelize.close();
  }
}

testPredioData();
