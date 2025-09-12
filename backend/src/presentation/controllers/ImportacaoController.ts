import { Request, Response } from 'express';
import { FornecedorRepository } from '../../infrastructure/repositories/FornecedorRepository';
import { CreateFornecedorUseCase } from '../../application/usecases/CreateFornecedorUseCase';
import { UpdateFornecedorUseCase } from '../../application/usecases/UpdateFornecedorUseCase';
import { parseFornecedoresExcel, sanitizeCnpj, isCnpjValid, parseProdutosExcel, parseSeparacaoExcel } from '../../utils/importUtils';
import { extractRequestContext } from '../../utils/requestHelpers';

export class ImportacaoController {
    async importar(req: Request, res: Response) {
        const tipo = req.body.tipo || req.query.tipo || req.params.tipo;
        // Aqui você pode usar req.file se usar multer, ou req.body.arquivo (base64/string)
        switch (tipo) {
            case 'produtos':
                return this.importarProdutos(req, res);
            case 'fornecedores':
                return this.importarFornecedores(req, res);
            case 'separacao':
                return this.importarSeparacao(req, res);
            default:
                return res.status(400).json({ message: 'Tipo de importação inválido' });
        }
    }

    async importarProdutos(req: Request, res: Response) {
        try {
            let buffer: Buffer;
            if (req.file && req.file.buffer) {
                buffer = req.file.buffer;
            } else if (req.body.arquivo) {
                buffer = Buffer.from(req.body.arquivo, 'base64');
            } else {
                return res.status(400).json({ message: 'Arquivo não enviado' });
            }

            // Função utilitária para parsear produtos do Excel (implementar em fornecedorImportUtils.ts ou similar)
            try {
                const produtos = parseProdutosExcel(buffer);
                const fornecedorRepoModule = await import('../../infrastructure/repositories/FornecedorRepository');
                const fornecedorRepository = new fornecedorRepoModule.FornecedorRepository();
                const produtoRepoModule = await import('../../infrastructure/repositories/ProdutoRepository');
                const produtoRepository = new produtoRepoModule.ProdutoRepository();

                function maskCnpj(cnpj: string) {
                    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                }

                const resultados = [];
                let seqId = 1;
                for (const row of produtos) {
                    // Função utilitária para garantir string
                    function safeString(val: any) {
                        if (val === undefined || val === null) return '';
                        if (typeof val === 'string') return val.trim();
                        if (typeof val === 'number') return String(val).trim();
                        return String(val).trim();
                    }

                    // Adapte aqui para todos os campos relevantes do produto
                    let cnpjOriginal = safeString(row.CnpjFornecedor);
                    let cnpjNumerico = sanitizeCnpj(cnpjOriginal);
                    let razaoSocial = safeString(row.RazaoSocial);
                    let codInterno = safeString(row.CodInterno);
                    let descricao = safeString(row.Descricao);
                    // Exemplo para outros campos numéricos:
                    let preco = safeString(row.Preco); // se existir campo Preco
                    let quantidade = safeString(row.Quantidade); // se existir campo Quantidade
                    let quantidadeMinimaVenda = safeString(
                        row.QuantidadeMinimaVenda ||
                        row.Quantidade_Minima_Venda ||
                        row.QtdMinimaVenda ||
                        row.Qtd_Minima_Venda ||
                        row.QuantMinVenda ||
                        row.Quant_Min_Venda
                    );
                    let quantCaixas = safeString(row.QuantCaixas || row.quantCaixas);
                    if (!quantCaixas) quantCaixas = '0';
                    let custo = safeString(row.Custo || row.PrecoCusto || row.Preco_Custo || row.ValorCusto);
                    let fornecedorNome = safeString(row.Fornecedor || row.RazaoSocial || row.FornecedorNome);

                    let status = 'Falha';
                    let observacao = '';
                    try {
                        // Validação básica dos campos obrigatórios
                        if (!codInterno || !descricao || !cnpjNumerico || !razaoSocial) {
                            observacao = 'Campos obrigatórios ausentes.';
                        } else if (!isCnpjValid(cnpjNumerico)) {
                            observacao = 'CNPJ do fornecedor inválido.';
                        } else {
                            // Busca fornecedor, mas NÃO cadastra
                            let fornecedor = await fornecedorRepository.findByCNPJ(cnpjNumerico);
                            if (!fornecedor) {
                                // tenta buscar com máscara
                                const cnpjMascara = maskCnpj(cnpjNumerico);
                                fornecedor = await fornecedorRepository.findByCNPJ(cnpjMascara);
                            }
                            // Busca produto por CodInterno, mas NÃO cadastra
                            let produtoExistente = await produtoRepository.findByCodInterno(Number(codInterno));
                            status = 'Sucesso';
                            if (!fornecedor && !produtoExistente) {
                                observacao += 'Fornecedor e produto serão cadastrados!';
                            } else if (!fornecedor) {
                                observacao += 'Fornecedor será cadastrado!';
                                observacao += produtoExistente ? ' Produto será atualizado!' : ' Produto será cadastrado!';
                            } else if (!produtoExistente) {
                                observacao += 'Produto será cadastrado!';
                            } else {
                                observacao += 'Produto será atualizado!';
                            }
                        }
                        if (status !== 'Sucesso') status = 'Falha';
                        resultados.push({
                            id: seqId++, // id sequencial provisório
                            codInterno,
                            descricao,
                            codBarras: safeString(row.CodBarras || row.codBarras),
                            codFabricante: safeString(row.CodFabricante || row.codFabricante),
                            cnpjFornecedor: isCnpjValid(cnpjNumerico) ? maskCnpj(cnpjNumerico) : cnpjOriginal,
                            fornecedor: fornecedorNome,
                            razaoSocial,
                            status,
                            observacao,
                            preco,
                            quantidade,
                            quantidadeMinimaVenda,
                            quantCaixas,
                            custo
                        });
                    } catch (rowErr) {
                        console.error('Erro processando linha de produto:', row, rowErr);
                    }
                }
                return res.json({ resultados });
            } catch (innerErr) {
                console.error('Erro ao importar módulos dinâmicos ou processar produtos:', innerErr);
                return res.status(500).json({ message: 'Erro ao importar módulos dinâmicos ou processar produtos', error: (innerErr as Error).message });
            }
        } catch (err) {
            console.error('Erro inesperado em importarProdutos:', err);
            return res.status(500).json({ message: 'Erro ao importar produtos', error: (err as Error).message });
        }
    }

    async confirmarImportacaoProdutos(req: Request, res: Response) {
        try {
            const produtos: any[] = req.body.produtos || [];
            if (!Array.isArray(produtos) || produtos.length === 0) {
                return res.status(400).json({ message: 'Nenhum produto enviado para confirmação.' });
            }
            const fornecedorRepository = new (await import('../../infrastructure/repositories/FornecedorRepository')).FornecedorRepository();
            const produtoRepository = new (await import('../../infrastructure/repositories/ProdutoRepository')).ProdutoRepository();
            const createProdutoUseCase = new (await import('../../application/usecases/CreateProdutoUseCase')).CreateProdutoUseCase(produtoRepository);
            const updateProdutoUseCase = new (await import('../../application/usecases/UpdateProdutoUseCase')).UpdateProdutoUseCase(produtoRepository);
            const { sanitizeCnpj, isCnpjValid } = await import('../../utils/importUtils');
            const { executorUserId } = (await import('../../utils/requestHelpers')).extractRequestContext(req);

            let adicionados = 0;
            let atualizados = 0;
            for (const row of produtos) {
                try {
                    const codInterno = row.codInterno;
                    const cnpjNumerico = sanitizeCnpj(row.cnpjFornecedor);
                    let fornecedor = await fornecedorRepository.findByCNPJ(cnpjNumerico);
                    if (!fornecedor) {
                        // tenta buscar com máscara
                        fornecedor = await fornecedorRepository.findByCNPJ(row.cnpjFornecedor);
                    }
                    if (!fornecedor && isCnpjValid(cnpjNumerico)) {
                        fornecedor = await fornecedorRepository.create({ cnpj: row.cnpjFornecedor, razaoSocial: row.razaoSocial });
                    }
                    // Conversão dos campos numéricos e tratamento de string vazia
                    function parseOrZero(val: any): number {
                        if (val === undefined || val === null || val === '') return 0;
                        return Number(val);
                    }
                    function parseOrUndefined(val: any): number | undefined {
                        if (val === undefined || val === null || val === '') return undefined;
                        return Number(val);
                    }
                    // Mapeamento para os nomes esperados pelo banco (Produto)
                    const produtoData = {
                        codInterno: parseOrZero(row.codInterno), // obrigatório
                        descricao: row.descricao,
                        quantMinVenda: parseOrZero(row.quantidadeMinimaVenda), // obrigatório
                        quantCaixas: parseOrZero(row.quantCaixas ?? 0), // se não vier, 0
                        custo: parseOrUndefined(row.custo), // opcional
                        codBarras: row.codBarras || undefined,
                        codFabricante: row.codFabricante || undefined,
                        idFornecedor: fornecedor?.id ?? 0,
                        executorUserId
                    };
                    let produtoExistente = await produtoRepository.findByCodInterno(codInterno);
                    if (produtoExistente) {
                        await updateProdutoUseCase.execute(produtoExistente.id, produtoData);
                        atualizados++;
                    } else {
                        await createProdutoUseCase.execute(produtoData);
                        adicionados++;
                    }
                } catch (erroRow) {
                }
            }
            return res.json({
                message: `Importação concluída com sucesso! ${adicionados} produto(s) adicionado(s), ${atualizados} atualizado(s).`,
                adicionados,
                atualizados
            });
        } catch (err) {
            console.error('Erro geral no confirmarImportacaoProdutos:', err);
            return res.status(500).json({ message: 'Erro ao confirmar importação de produtos', error: (err as Error).message });
        }
    }

    async importarFornecedores(req: Request, res: Response) {
        try {
            // Suporta arquivo em req.file.buffer (multer) ou req.body.arquivo (base64)
            let buffer: Buffer;
            if (req.file && req.file.buffer) {
                buffer = req.file.buffer;
            } else if (req.body.arquivo) {
                buffer = Buffer.from(req.body.arquivo, 'base64');
            } else {
                return res.status(400).json({ message: 'Arquivo não enviado' });
            }

            const fornecedores = parseFornecedoresExcel(buffer);
            const fornecedorRepository = new FornecedorRepository();

            function maskCnpj(cnpj: string) {
                return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            }

            const resultados = [];
            for (const row of fornecedores) {
                let cnpjOriginal = (row.cnpj || '').trim();
                let cnpjNumerico = sanitizeCnpj(cnpjOriginal);
                let razaoSocial = (row.razaoSocial || '').trim();
                let status = 'Falha';
                let observacao = '';

                if (!cnpjNumerico || !razaoSocial) {
                    observacao = 'CNPJ ou Razão Social vazio.';
                } else if (!isCnpjValid(cnpjNumerico)) {
                    observacao = 'Não vai ser possível efetuar cadastro. Cnpj fora do padrão. Ajustar o campo e tente novamente!';
                } else {
                    // Buscar no banco tanto com máscara quanto sem máscara
                    let existente = await fornecedorRepository.findByCNPJ(cnpjNumerico);
                    if (!existente) {
                        // tenta buscar com máscara
                        const cnpjMascara = maskCnpj(cnpjNumerico);
                        existente = await fornecedorRepository.findByCNPJ(cnpjMascara);
                    }
                    if (existente) {
                        status = 'Sucesso';
                        observacao = 'Fornecedor será atualizado!';
                    } else {
                        status = 'Sucesso';
                        observacao = 'Fornecedor será cadastrado!';
                    }
                }
                if (status !== 'Sucesso') status = 'Falha';
                // Sempre retorna o CNPJ mascarado se for válido
                const cnpjParaRetorno = isCnpjValid(cnpjNumerico) ? maskCnpj(cnpjNumerico) : cnpjOriginal;
                resultados.push({ cnpj: cnpjParaRetorno, razaoSocial, status, observacao });
            }
            return res.json({ resultados });
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao importar fornecedores', error: (err as Error).message });
        }
    }

    async confirmarImportacao(req: Request, res: Response) {
        try {
            const fornecedores: { cnpj: string, razaoSocial: string }[] = req.body.fornecedores || [];
            if (!Array.isArray(fornecedores) || fornecedores.length === 0) {
                return res.status(400).json({ message: 'Nenhum fornecedor enviado para confirmação.' });
            }
            const fornecedorRepository = new FornecedorRepository();
            const createFornecedorUseCase = new CreateFornecedorUseCase(fornecedorRepository);
            const updateFornecedorUseCase = new UpdateFornecedorUseCase(fornecedorRepository);
            const { executorUserId } = extractRequestContext(req);

            let adicionados = 0;
            let atualizados = 0;
            for (const row of fornecedores) {
                const cnpjNumerico = sanitizeCnpj(row.cnpj);
                let existente = await fornecedorRepository.findByCNPJ(cnpjNumerico);
                if (!existente) {
                    // tenta buscar com máscara
                    const cnpjMascara = row.cnpj;
                    existente = await fornecedorRepository.findByCNPJ(cnpjMascara);
                }
                if (existente) {
                    await updateFornecedorUseCase.execute(existente.id, { razaoSocial: row.razaoSocial, cnpj: existente.cnpj, executorUserId });
                    atualizados++;
                } else {
                    await createFornecedorUseCase.execute({ razaoSocial: row.razaoSocial, cnpj: row.cnpj, executorUserId });
                    adicionados++;
                }
            }
            return res.json({
                message: `Importação concluída com sucesso! ${adicionados} fornecedor(es) adicionado(s), ${atualizados} atualizado(s).`,
                adicionados,
                atualizados
            });
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao confirmar importação', error: (err as Error).message });
        }
    }

    async importarSeparacao(req: Request, res: Response) {
        try {
            let buffer: Buffer;
            if (req.file && req.file.buffer) {
                buffer = req.file.buffer;
            } else if (req.body.arquivo) {
                buffer = Buffer.from(req.body.arquivo, 'base64');
            } else {
                return res.status(400).json({ message: 'Arquivo não enviado' });
            }

            // Função utilitária para parsear separação do Excel (implementar em importUtils.ts ou similar)
            try {
                const separacoes = parseSeparacaoExcel(buffer);
                // Função utilitária para garantir string
                function safeString(val: any) {
                    if (val === undefined || val === null) return '';
                    if (typeof val === 'string') return val.trim();
                    if (typeof val === 'number') return String(val).trim();
                    return String(val).trim();
                }

                // Função para normalizar campos-chave
                function normalize(val: any) {
                    return (val === undefined || val === null) ? '' : String(val).trim().toUpperCase();
                }

                // Monta lista de pedidos a partir do Excel, normalizando campos-chave
                const pedidos = separacoes.map((row: any, idx: number) => ({
                    pedidoId: idx + 1,
                    codInterno: normalize(safeString(row.CodProduto || row.CodInterno)),
                    descricao: safeString(row.Descricao),
                    codFabricante: safeString(row.CodFabricante),
                    lote: normalize(safeString(row.Lote)),
                    tonalidade: normalize(row.Tonalidade), // Garante string maiúscula
                    bitola: normalize(row.Bitola), // Garante string maiúscula
                    // Mantém o valor informado no arquivo para referência
                    quantMinimaVenda: Number(row.QuantMinimaVenda) || 0,
                    // Converte a quantidade solicitada para a mesma unidade do estoque/endereço (m²): caixas * quantMinimaVenda
                    quantidade: (Number(row.Quantidade) || 0) * (Number(row.QuantMinimaVenda) > 0 ? Number(row.QuantMinimaVenda) : 1),
                    rotaPedido: safeString(row['Rota Pedido'] || row.RotaPedido)
                }));

                // Função principal de alocação de estoque
                async function alocarEstoqueParaPedidos(pedidos: any[]) {
                    // Buscar estoques disponíveis
                    const estoqueItensRepoModule = await import('../../infrastructure/repositories/EstoqueItemRepository');
                    const estoqueItemRepository = new estoqueItensRepoModule.EstoqueItemRepository();
                    const enderecamentoRepoModule = await import('../../infrastructure/repositories/EnderecamentoRepository');
                    const enderecamentoRepository = new enderecamentoRepoModule.EnderecamentoRepository();

                    // Buscar todos os EstoqueItens e Enderecamentos disponíveis
                    const estoqueItens = await estoqueItemRepository.findAll();
                    const enderecamentos = await enderecamentoRepository.findAll();

                    console.log('EstoqueItens originais:', JSON.stringify(estoqueItens, null, 2));
                    console.log('Enderecamentos originais:', JSON.stringify(enderecamentos, null, 2));

                    // Filtrar apenas os produtos/tonalidades/bitolas/lotes necessários
                    const codInternos = [...new Set(pedidos.map(p => Number(p.codInterno)).filter(Boolean))];
                    const tonalidades = [...new Set(pedidos.map(p => p.tonalidade))];
                    const bitolas = [...new Set(pedidos.map(p => p.bitola))];
                    const lotes = [...new Set(pedidos.map(p => p.lote))];
                    // Normaliza campos dos estoques para garantir comparação correta
                    const estoqueItensFiltrados = estoqueItens.filter((item: any) => {
                        const codInterno = item.codInterno ?? item.produto?.codInterno;
                        const tonalidade = item.tonalidade ?? item.ton ?? item.produto?.tonalidade ?? item.produto?.ton;
                        const bitola = item.bitola ?? item.bit ?? item.produto?.bitola ?? item.produto?.bit;
                        const lote = item.lote ?? item.produto?.lote;
                        const codInternoNorm = normalize(String(codInterno));
                        const tonalidadeNorm = normalize(tonalidade);
                        const bitolaNorm = normalize(bitola);
                        const loteNorm = normalize(lote);
                        const match = codInternos.includes(Number(codInterno)) &&
                            (!tonalidade || tonalidades.includes(tonalidadeNorm)) &&
                            (!bitola || bitolas.includes(bitolaNorm)) &&
                            (!lote || lotes.includes(loteNorm));
                        if (codInternos.includes(Number(codInterno))) {
                            console.log('[DEBUG ESTOQUE COMPARE]', {
                                itemOriginal: item,
                                camposUsados: { codInterno, tonalidade, bitola, lote },
                                normalizados: { codInternoNorm, tonalidadeNorm, bitolaNorm, loteNorm },
                                listas: { tonalidades, bitolas, lotes },
                                match
                            });
                        }
                        return match;
                    });
                    const enderecamentosFiltrados = enderecamentos.filter((end: any) => {
                        const codInterno = end.codInterno ?? end.produto?.codInterno;
                        const tonalidade = end.tonalidade ?? end.produto?.tonalidade;
                        const bitola = end.bitola ?? end.produto?.bitola;
                        const lote = end.lote ?? end.produto?.lote;
                        const codInternoNorm = normalize(String(codInterno));
                        const tonalidadeNorm = normalize(tonalidade);
                        const bitolaNorm = normalize(bitola);
                        const loteNorm = normalize(lote);
                        const match = codInternos.includes(Number(codInterno)) &&
                            (!tonalidade || tonalidades.includes(tonalidadeNorm)) &&
                            (!bitola || bitolas.includes(bitolaNorm)) &&
                            (!lote || lotes.includes(loteNorm));
                        if (codInternos.includes(Number(codInterno))) {
                            console.log('[DEBUG ENDERECAMENTO COMPARE]', {
                                endOriginal: end,
                                camposUsados: { codInterno, tonalidade, bitola, lote },
                                normalizados: { codInternoNorm, tonalidadeNorm, bitolaNorm, loteNorm },
                                listas: { tonalidades, bitolas, lotes },
                                match
                            });
                        }
                        return match;
                    });
                    console.log('EstoqueItens filtrados:', JSON.stringify(estoqueItensFiltrados, null, 2));
                    console.log('Enderecamentos filtrados:', JSON.stringify(enderecamentosFiltrados, null, 2));

                    // Indexar estoques por produto/tonalidade/bitola/lote
                    function keyEstoque(e: any) {
                        // Busca campos na raiz ou em produto
                        const codInterno = e.codInterno ?? e.produto?.codInterno;
                        const tonalidade = e.tonalidade ?? e.ton ?? e.produto?.tonalidade ?? e.produto?.ton;
                        const bitola = e.bitola ?? e.bit ?? e.produto?.bitola ?? e.produto?.bit;
                        const lote = e.lote ?? e.produto?.lote;
                        return [normalize(codInterno), normalize(tonalidade), normalize(bitola), normalize(lote)].join('|');
                    }
                    // Agrupar EstoqueItens
                    const estoqueSetor: Record<string, any[]> = {};
                    for (const item of estoqueItensFiltrados) {
                        const k = keyEstoque(item);
                        if (!estoqueSetor[k]) estoqueSetor[k] = [];
                        estoqueSetor[k].push(item);
                    }
                    // Agrupar Enderecamentos
                    const estoqueEndereco: Record<string, any[]> = {};
                    for (const end of enderecamentosFiltrados) {
                        const k = keyEstoque(end);
                        if (!estoqueEndereco[k]) estoqueEndereco[k] = [];
                        estoqueEndereco[k].push(end);
                    }

                    // Calcular disponibilidade por lote
                    const disponibilidadeSetor: Record<string, number> = {};
                    for (const k in estoqueSetor) {
                        disponibilidadeSetor[k] = estoqueSetor[k].reduce((s, i) => s + Number(i.quantidade), 0);
                    }
                    const disponibilidadeEndereco: Record<string, number> = {};
                    for (const k in estoqueEndereco) {
                        disponibilidadeEndereco[k] = estoqueEndereco[k].reduce((s, e) => {
                            // Busca quantCaixas e quantMinVenda na raiz ou em produto
                            const quantCaixas = Number(e.quantCaixas ?? e.caixas ?? e.produto?.quantCaixas ?? 0);
                            const quantMinVenda = Number(e.quantMinVenda ?? e.produto?.quantMinVenda ?? 0);
                            return s + (quantCaixas * quantMinVenda);
                        }, 0);
                    }

                    // Mapa de saldo por pallet para reuso entre pedidos
                    const palletSaldo: Record<string | number, number> = {};
                    for (const k in estoqueEndereco) {
                        for (const pallet of estoqueEndereco[k]) {
                            const quantCaixas = Number(pallet.quantCaixas ?? pallet.caixas ?? pallet.produto?.quantCaixas ?? 0);
                            const quantMinVenda = Number(pallet.quantMinVenda ?? pallet.produto?.quantMinVenda ?? 0);
                            const disp = quantCaixas * quantMinVenda;
                            palletSaldo[pallet.id] = (palletSaldo[pallet.id] ?? 0) + disp;
                        }
                    }

                    // Variáveis para reservas do endereçamento (preenchidas após calcular demanda)
                    const reservaMinimaEndereco: Record<string, number> = {};
                    const excedenteEndereco: Record<string, number> = {};

                    // Demanda por lote
                    const demandaPorLote: Record<string, number> = {};
                    for (const p of pedidos) {
                        const k = keyEstoque(p);
                        demandaPorLote[k] = (demandaPorLote[k] || 0) + Number(p.quantidade);
                    }

                    // Reserva mínima e excedente para endereçamento (respeita demanda do mesmo lote)
                    for (const k in disponibilidadeEndereco) {
                        reservaMinimaEndereco[k] = Math.min(disponibilidadeEndereco[k], demandaPorLote[k] || 0);
                        excedenteEndereco[k] = disponibilidadeEndereco[k] - reservaMinimaEndereco[k];
                    }

                    // Reserva mínima e excedente
                    const reservaMinima: Record<string, number> = {};
                    const excedente: Record<string, number> = {};
                    for (const k in disponibilidadeSetor) {
                        reservaMinima[k] = Math.min(disponibilidadeSetor[k], demandaPorLote[k] || 0);
                        excedente[k] = disponibilidadeSetor[k] - reservaMinima[k];
                    }

                    // Controle de pallets já usados
                    const enderecamentosUsados: { id: any, lote: string, quantidadeConsumida: number }[] = [];
                    const palletsConsumidos = new Set();

                    // Ordenação dos pedidos: mais restritos (pedem lote) e maiores quantidades primeiro
                    pedidos.sort((a, b) => {
                        if (a.lote && !b.lote) return -1;
                        if (!a.lote && b.lote) return 1;
                        return b.quantidade - a.quantidade;
                    });

                    // Resultado final
                    const resultados: any[] = [];

                    console.log('Pedidos recebidos para alocação:', JSON.stringify(pedidos, null, 2));
                    console.log('Disponibilidade inicial setor:', JSON.stringify(disponibilidadeSetor, null, 2));
                    console.log('Disponibilidade inicial endereçamento:', JSON.stringify(disponibilidadeEndereco, null, 2));
                    for (const pedido of pedidos) {

                        const k = keyEstoque(pedido);
                        let quantidadeRestante = pedido.quantidade;
                        let detalhes: any[] = [];
                        let status = '';
                        let observacao = '';
                        console.log(`\nProcessando pedidoId=${pedido.pedidoId} | codInterno=${pedido.codInterno} | lote=${pedido.lote} | quantidade=${pedido.quantidade}`);

                        // Helper para montar detalhe completo
                        const toStringSafe = (val: any) => (val === undefined || val === null) ? '' : String(val);
                        const buildDetalhe = (lote: string, fonte: string, quantidade: number) => ({
                            codInterno: toStringSafe(pedido.codInterno),
                            descricao: toStringSafe(pedido.descricao),
                            codFabricante: toStringSafe(pedido.codFabricante),
                            tonalidade: toStringSafe(pedido.tonalidade),
                            bitola: toStringSafe(pedido.bitola),
                            quantMinimaVenda: toStringSafe(pedido.quantMinimaVenda),
                            quantidade: toStringSafe(pedido.quantidade),
                            lote: toStringSafe(lote && lote !== '' ? lote : (pedido.lote ?? 'N/A')),
                            fonte: toStringSafe(fonte),
                            quantidadeAlocada: quantidade,
                            observacao: toStringSafe(observacao),
                            status: toStringSafe(status)
                        });

                        // Passo 1: Mesmo lote no setor
                        if (disponibilidadeSetor[k] >= quantidadeRestante) {
                            status = 'Sucesso';
                            observacao = 'Atendido no lote preferido.';
                            detalhes.push(buildDetalhe(pedido.lote, 'setor', quantidadeRestante));
                            disponibilidadeSetor[k] -= quantidadeRestante;
                            reservaMinima[k] = Math.max(0, reservaMinima[k] - quantidadeRestante);
                            excedente[k] = Math.max(0, excedente[k] - quantidadeRestante);
                            quantidadeRestante = 0;
                            console.log(`  Atendido no setor (lote preferido). Disponibilidade após: ${disponibilidadeSetor[k]}`);
                        }

                        // Passo 2: Outro lote no setor (sem mistura)
                        if (quantidadeRestante > 0) {
                            console.log(`  Tentando atender em outro lote do setor. Quantidade restante: ${quantidadeRestante}`);
                            for (const k2 in excedente) {
                                if (k2 !== k && excedente[k2] >= quantidadeRestante) {
                                    const [codInterno2, tonalidade2, bitola2, lote2] = k2.split('|');
                                    if (codInterno2 === pedido.codInterno && tonalidade2 === pedido.tonalidade && bitola2 === pedido.bitola) {
                                        status = 'Sucesso';
                                        observacao = `Atendido em outro lote do setor: lote=${lote2}, quantidade=${quantidadeRestante}`;
                                        detalhes.push(buildDetalhe(lote2, 'setor', quantidadeRestante));
                                        disponibilidadeSetor[k2] -= quantidadeRestante;
                                        excedente[k2] = Math.max(0, excedente[k2] - quantidadeRestante);
                                        quantidadeRestante = 0;
                                        console.log(`    Atendido em outro lote do setor: lote=${lote2}, quantidade=${quantidadeRestante}`);
                                        break;
                                    }
                                }
                            }
                        }

                        // Passo 3: Endereçamento (mesmo lote primeiro)
                        if (quantidadeRestante > 0 && disponibilidadeEndereco[k] >= quantidadeRestante) {
                            console.log(`  Tentando atender no endereçamento (mesmo lote) — tudo ou nada. Quantidade solicitada: ${quantidadeRestante}`);
                            let consumido = 0;
                            for (const pallet of estoqueEndereco[k]) {
                                if (palletsConsumidos.has(pallet.id)) continue;
                                const palletDisponivel = Number(palletSaldo[pallet.id] ?? 0);
                                if (palletDisponivel <= 0) continue;
                                const restanteParaEstePasso = quantidadeRestante - consumido;
                                if (restanteParaEstePasso <= 0) break;
                                const consumirPallet = Math.min(restanteParaEstePasso, palletDisponivel);
                                if (consumirPallet > 0) {
                                    detalhes.push(buildDetalhe(pallet.lote, 'enderecamento', consumirPallet));
                                    enderecamentosUsados.push({ id: pallet.id, lote: pallet.lote, quantidadeConsumida: consumirPallet });
                                    disponibilidadeEndereco[k] -= consumirPallet;
                                    palletSaldo[pallet.id] = Math.max(0, palletDisponivel - consumirPallet);
                                    if (palletSaldo[pallet.id] <= 0) palletsConsumidos.add(pallet.id);
                                    // Consome primeiro a reserva mínima desse lote
                                    const consReserva = Math.min(consumirPallet, reservaMinimaEndereco[k] || 0);
                                    reservaMinimaEndereco[k] = Math.max(0, (reservaMinimaEndereco[k] || 0) - consReserva);
                                    excedenteEndereco[k] = Math.max(0, (excedenteEndereco[k] || 0) - Math.max(0, consumirPallet - consReserva));
                                    consumido += consumirPallet;
                                }
                            }
                            if (consumido >= quantidadeRestante) {
                                status = 'Sucesso';
                                observacao = 'Atendido em mesmo lote (endereçamento).';
                                quantidadeRestante = 0;
                                console.log('    Atendido totalmente no endereçamento (mesmo lote)');
                            } else {
                                // Rollback local: se não alcançou o total, desfaz detalhes adicionados deste passo
                                for (const d of detalhes.filter(d => d.fonte === 'enderecamento' && d.lote === (pedido.lote || ''))) {
                                    // Não temos como repor de volta exatamente nos pallets sem mais estado; como guardião: manteremos a política de não entrar aqui porque a checagem de disponibilidade já garante.
                                }
                            }
                        }

                        // Passo 3.2: Outro lote no endereçamento (sem mistura)
                        if (quantidadeRestante > 0) {
                            console.log(`  Tentando atender em outro lote do endereçamento. Quantidade restante: ${quantidadeRestante}`);
                            for (const k2 in disponibilidadeEndereco) {
                                if (k2 !== k && excedenteEndereco[k2] >= quantidadeRestante) {
                                    const [codInterno2, tonalidade2, bitola2, lote2] = k2.split('|');
                                    if (codInterno2 === pedido.codInterno && tonalidade2 === pedido.tonalidade && bitola2 === pedido.bitola) {
                                        for (const pallet of estoqueEndereco[k2]) {
                                            if (palletsConsumidos.has(pallet.id)) continue;
                                            const palletDisponivel = Number(palletSaldo[pallet.id] ?? 0);
                                            if (palletDisponivel <= 0) continue;
                                            let consumirPallet = Math.min(quantidadeRestante, palletDisponivel);
                                            if (consumirPallet > 0) {
                                                status = 'Sucesso';
                                                observacao = `Atendido em outro lote do endereçamento: lote=${lote2}, quantidade=${consumirPallet}`;
                                                detalhes.push(buildDetalhe(pallet.lote, 'enderecamento', consumirPallet));
                                                enderecamentosUsados.push({ id: pallet.id, lote: pallet.lote, quantidadeConsumida: consumirPallet });
                                                disponibilidadeEndereco[k2] -= consumirPallet;
                                                palletSaldo[pallet.id] = Math.max(0, palletDisponivel - consumirPallet);
                                                if (palletSaldo[pallet.id] <= 0) palletsConsumidos.add(pallet.id);
                                                excedenteEndereco[k2] = Math.max(0, (excedenteEndereco[k2] || 0) - consumirPallet);
                                                quantidadeRestante -= consumirPallet;
                                                console.log(`    Atendido em outro lote do endereçamento: lote=${lote2}, quantidade=${consumirPallet}`);
                                                break;
                                            }
                                        }
                                        if (quantidadeRestante <= 0) {
                                            quantidadeRestante = 0;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        // Passo 3.3 desativado: não permitir mistura de lotes no endereçamento

                        // Passo 4: Não atender se não houver capacidade total
                        if (quantidadeRestante > 0 && !status) {
                            status = 'Falha';
                            observacao = 'Estoque insuficiente para atendimento completo.';
                            console.log('  Pedido não atendido por falta de capacidade total.');
                            // Garantir pelo menos um detalhe com os campos do pedido
                            if (detalhes.length === 0) {
                                detalhes.push(buildDetalhe(pedido.lote, '', 0));
                            }
                        }

                        console.log(`  Resultado do pedidoId=${pedido.pedidoId}: status=${status}, detalhes=`, detalhes);
                        resultados.push({
                            pedidoId: pedido.pedidoId,
                            codInterno: pedido.codInterno,
                            descricao: pedido.descricao,
                            codFabricante: pedido.codFabricante,
                            tonalidade: pedido.tonalidade,
                            bitola: pedido.bitola,
                            quantMinimaVenda: pedido.quantMinimaVenda,
                            quantidade: pedido.quantidade,
                            lote: pedido.lote,
                            rotaPedido: pedido.rotaPedido,
                            status,
                            observacao,
                            detalhes
                        });
                    }

                    return { resultados, enderecamentosUsados };
                }

                // Chama a função de alocação e retorna o resultado
                const alocacao = await alocarEstoqueParaPedidos(pedidos);
                return res.json(alocacao);
            } catch (innerErr) {
                console.error('Erro ao importar módulos dinâmicos ou processar separação:', innerErr);
                return res.status(500).json({ message: 'Erro ao importar módulos dinâmicos ou processar separação', error: (innerErr as Error).message });
            }
        } catch (err) {
            console.error('Erro inesperado em importarSeparacao:', err);
            return res.status(500).json({ message: 'Erro ao importar separação', error: (err as Error).message });
        }
    }
}
