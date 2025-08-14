const axios = require('axios');

async function testAPI() {
    try {
        console.log('Testando API de endereçamentos...\n');
        
        // Fazer login primeiro para obter token
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@casamattos.com',
            senha: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('Login realizado com sucesso!\n');
        
        // Testar a listagem de endereçamentos
        const enderecamentosResponse = await axios.get('http://localhost:3001/api/enderecamentos/disponiveis', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        const enderecamentos = enderecamentosResponse.data;
        console.log(`Encontrados ${enderecamentos.length} endereçamentos disponíveis:\n`);
        
        enderecamentos.forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id}`);
            console.log(`   Produto: ${item.produto?.codInterno} - ${item.produto?.descricao}`);
            console.log(`   Localização: ${item.predio?.rua?.nomeRua || 'RUA NÃO INFORMADA'} - ${item.predio?.nomePredio}`);
            console.log(`   Tonalidade: ${item.tonalidade}, Bitola: ${item.bitola}`);
            console.log(`   Disponível: ${item.disponivel}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('Erro ao testar API:', error.response?.data || error.message);
    }
}

testAPI();
