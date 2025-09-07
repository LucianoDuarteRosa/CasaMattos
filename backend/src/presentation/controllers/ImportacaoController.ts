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
                    console.error('Erro ao processar produto:', row, erroRow);
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
        console.log('[importarSeparacao] Início do método');
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
                console.log('[importarSeparacao] Parseando Excel...');
                const separacoes = parseSeparacaoExcel(buffer);
                console.log('[importarSeparacao] Pedidos extraídos:', separacoes.length);
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
                    tonalidade: normalize(row.Tonalidade),
                    bitola: normalize(row.Bitola),
                    quantMinimaVenda: Number(row.QuantMinimaVenda) || 0,
                    quantidade: Number(row.Quantidade) || 0,
                    rotaPedido: safeString(row['Rota Pedido'] || row.RotaPedido)
                }));
                console.log('[importarSeparacao] Pedidos normalizados:', pedidos.length);

                // Função principal de alocação de estoque
                async function alocarEstoqueParaPedidos(pedidos: any[]) {
                    console.log('[alocarEstoqueParaPedidos] Início da alocação');
                    // Buscar estoques disponíveis
                    const estoqueItensRepoModule = await import('../../infrastructure/repositories/EstoqueItemRepository');
                    const estoqueItemRepository = new estoqueItensRepoModule.EstoqueItemRepository();
                    const enderecamentoRepoModule = await import('../../infrastructure/repositories/EnderecamentoRepository');
                    const enderecamentoRepository = new enderecamentoRepoModule.EnderecamentoRepository();

                    // Buscar todos os EstoqueItens e Enderecamentos disponíveis
                    const estoqueItens = await estoqueItemRepository.findAll();
                    const enderecamentos = await enderecamentoRepository.findAll();
                    console.log('[alocarEstoqueParaPedidos] Endereçamentos disponíveis:', enderecamentos);
                    console.log('[alocarEstoqueParaPedidos] Estoque itens:', estoqueItens.length);
                    console.log('[alocarEstoqueParaPedidos] Enderecamentos:', enderecamentos.length);

                    // Filtrar apenas pelos códigos internos dos produtos (não restringir por lote/tonalidade/bitola)
                    const codInternos = [...new Set(pedidos.map(p => Number(p.codInterno)).filter(Boolean))];
                    console.log('[alocarEstoqueParaPedidos] Códigos internos dos pedidos:', codInternos);

                    // Normaliza campos dos estoques para garantir comparação correta
                    const estoqueItensFiltrados = estoqueItens.filter((item: any) => {
                        const codInterno = item.codInterno ?? item.produto?.codInterno;
                        return codInternos.includes(Number(codInterno));
                    });
                    console.log('[alocarEstoqueParaPedidos] Estoque itens filtrados:', estoqueItensFiltrados.length);

                    // Filtrar endereçamentos apenas pelo código interno do produto
                    const enderecamentosFiltrados = enderecamentos.filter((end: any) => {
                        const codInterno = end.codInterno ?? end.produto?.codInterno;
                        return codInternos.includes(Number(codInterno));
                    });
                    console.log('[alocarEstoqueParaPedidos] Enderecamentos filtrados:', enderecamentosFiltrados.length);
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

                    // Log resumo da disponibilidade por produto
                    console.log('[alocarEstoqueParaPedidos] Resumo da disponibilidade por lote:');
                    for (const k in disponibilidadeEndereco) {
                        const [codInterno, tonalidade, bitola, lote] = k.split('|');
                        console.log(`  Produto ${codInterno} - Lote: ${lote}, Ton: ${tonalidade}, Bit: ${bitola} => ${disponibilidadeEndereco[k]} unidades`);
                    }

                    // Demanda por lote
                    const demandaPorLote: Record<string, number> = {};
                    for (const p of pedidos) {
                        const k = keyEstoque(p);
                        demandaPorLote[k] = (demandaPorLote[k] || 0) + Number(p.quantidade);
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
                    const palletsConsumidos = new Map<any, number>(); // id do pallet -> quantidade total consumida

                    // Ordenação dos pedidos: mais restritos (pedem lote) e maiores quantidades primeiro
                    pedidos.sort((a, b) => {
                        if (a.lote && !b.lote) return -1;
                        if (!a.lote && b.lote) return 1;
                        return b.quantidade - a.quantidade;
                    });

                    // Resultado final
                    const resultados: any[] = [];

                    for (const pedido of pedidos) {
                        const k = keyEstoque(pedido);
                        console.log(`[alocarEstoqueParaPedidos] Pedido ${pedido.pedidoId}: codInterno=${pedido.codInterno}, lote=${pedido.lote}, ton=${pedido.tonalidade}, bitola=${pedido.bitola}, quantidade=${pedido.quantidade}`);
                        // Log de disponibilidade para cada pedido
                        console.log('[alocarEstoqueParaPedidos] Disponibilidade setor:', disponibilidadeSetor[k], '| Disponibilidade endereçamento:', disponibilidadeEndereco[k]);

                        // ...já declarado acima...
                        let quantidadeRestante = pedido.quantidade;
                        let detalhes: any[] = [];
                        let status = '';
                        let observacao = '';

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
                        }

                        // Passo 2: Outro lote no setor (sem mistura)
                        if (quantidadeRestante > 0) {
                            let encontrouOutroLoteSetor = false;
                            for (const k2 in excedente) {
                                if (k2 !== k && excedente[k2] >= quantidadeRestante) {
                                    const [codInterno2, tonalidade2, bitola2, lote2] = k2.split('|');
                                    if (codInterno2 === pedido.codInterno && tonalidade2 === pedido.tonalidade && bitola2 === pedido.bitola) {
                                        encontrouOutroLoteSetor = true;
                                        status = 'Sucesso';
                                        observacao = `Atendido em outro lote do setor: lote=${lote2}, quantidade=${quantidadeRestante}`;
                                        detalhes.push(buildDetalhe(lote2, 'setor', quantidadeRestante));
                                        disponibilidadeSetor[k2] -= quantidadeRestante;
                                        excedente[k2] = Math.max(0, excedente[k2] - quantidadeRestante);
                                        quantidadeRestante = 0;
                                        break;
                                    }
                                }
                            }
                        }

                        // Passo 3: Endereçamento (mesmo lote primeiro)
                        if (quantidadeRestante > 0 && disponibilidadeEndereco[k] > 0) {
                            let disponivelEndereco = disponibilidadeEndereco[k];
                            let consumir = Math.min(quantidadeRestante, disponivelEndereco);
                            if (consumir > 0) {
                                for (const pallet of estoqueEndereco[k]) {
                                    const quantidadeJaConsumida = palletsConsumidos.get(pallet.id) || 0;
                                    let quantCaixas = Number(pallet.quantCaixas ?? pallet.caixas ?? pallet.produto?.quantCaixas ?? 0);
                                    let quantMinVenda = Number(pallet.quantMinVenda ?? pallet.produto?.quantMinVenda ?? 0);
                                    let palletDisponivel = (quantCaixas * quantMinVenda) - quantidadeJaConsumida;
                                    if (palletDisponivel <= 0) continue;
                                    let consumirPallet = Math.min(consumir, palletDisponivel);
                                    if (consumirPallet > 0) {
                                        status = 'Sucesso';
                                        observacao = 'Atendido em mesmo lote (endereçamento).';
                                        detalhes.push(buildDetalhe(pallet.lote, 'enderecamento', consumirPallet));
                                        enderecamentosUsados.push({ id: pallet.id, lote: pallet.lote, quantidadeConsumida: consumirPallet });
                                        palletsConsumidos.set(pallet.id, quantidadeJaConsumida + consumirPallet);
                                        disponibilidadeEndereco[k] -= consumirPallet;
                                        consumir -= consumirPallet;
                                        if (consumir <= 0) break;
                                    }
                                }
                                if (consumir <= 0) {
                                    quantidadeRestante = 0;
                                }
                            }
                        }

                        // Passo 3.2: Outro lote no endereçamento (sem mistura)
                        if (quantidadeRestante > 0) {
                            console.log(`[alocarEstoqueParaPedidos] Buscando outros lotes para pedido ${pedido.pedidoId}`);
                            let encontrouOutroLoteEndereco = false;

                            // Buscar todos os lotes disponíveis do mesmo produto
                            const lotesAlternativos = Object.keys(disponibilidadeEndereco).filter(k2 => {
                                if (k2 === k) return false; // Pular o mesmo lote
                                const [codInterno2] = k2.split('|');
                                return codInterno2 === pedido.codInterno;
                            });

                            console.log(`[alocarEstoqueParaPedidos] Lotes alternativos encontrados:`, lotesAlternativos.map(k2 => {
                                const [codInterno2, tonalidade2, bitola2, lote2] = k2.split('|');
                                return { lote: lote2, tonalidade: tonalidade2, bitola: bitola2, disponivel: disponibilidadeEndereco[k2] };
                            }));

                            for (const k2 of lotesAlternativos) {
                                if (disponibilidadeEndereco[k2] >= quantidadeRestante) {
                                    const [codInterno2, tonalidade2, bitola2, lote2] = k2.split('|');
                                    console.log(`[alocarEstoqueParaPedidos] Tentando lote alternativo: ${lote2} (ton: ${tonalidade2}, bit: ${bitola2})`);

                                    for (const pallet of estoqueEndereco[k2]) {
                                        const quantidadeJaConsumida = palletsConsumidos.get(pallet.id) || 0;
                                        let quantCaixas = Number(pallet.quantCaixas ?? pallet.caixas ?? pallet.produto?.quantCaixas ?? 0);
                                        let quantMinVenda = Number(pallet.quantMinVenda ?? pallet.produto?.quantMinVenda ?? 0);
                                        let palletDisponivel = (quantCaixas * quantMinVenda) - quantidadeJaConsumida;
                                        if (palletDisponivel <= 0) continue;
                                        let consumirPallet = Math.min(quantidadeRestante, palletDisponivel);
                                        if (consumirPallet > 0) {
                                            encontrouOutroLoteEndereco = true;
                                            status = 'Sucesso';
                                            observacao = `Atendido em outro lote do endereçamento: lote=${lote2}, ton=${tonalidade2}, bit=${bitola2}, quantidade=${consumirPallet}`;
                                            detalhes.push(buildDetalhe(pallet.lote, 'enderecamento', consumirPallet));
                                            enderecamentosUsados.push({ id: pallet.id, lote: pallet.lote, quantidadeConsumida: consumirPallet });
                                            palletsConsumidos.set(pallet.id, quantidadeJaConsumida + consumirPallet);
                                            disponibilidadeEndereco[k2] -= consumirPallet;
                                            quantidadeRestante -= consumirPallet;
                                            console.log(`[alocarEstoqueParaPedidos] Alocado ${consumirPallet} do lote ${lote2}. Restante: ${quantidadeRestante}`);
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

                        // Passo 3.3: Mistura de lotes no endereçamento (otimizada para minimizar fontes)
                        if (quantidadeRestante > 0) {
                            console.log(`[alocarEstoqueParaPedidos] Tentando mistura de lotes para pedido ${pedido.pedidoId}. Quantidade restante: ${quantidadeRestante}`);

                            // Buscar todos os lotes do mesmo produto e calcular melhor combinação
                            const lotesDisponiveis = [];
                            for (const k2 in disponibilidadeEndereco) {
                                const [codInterno2, tonalidade2, bitola2, lote2] = k2.split('|');
                                if (codInterno2 === pedido.codInterno && disponibilidadeEndereco[k2] > 0) {
                                    lotesDisponiveis.push({
                                        chave: k2,
                                        lote: lote2,
                                        tonalidade: tonalidade2,
                                        bitola: bitola2,
                                        disponivel: disponibilidadeEndereco[k2]
                                    });
                                }
                            }

                            // Ordenar lotes por quantidade disponível (maior primeiro) para minimizar mistura
                            lotesDisponiveis.sort((a, b) => b.disponivel - a.disponivel);
                            console.log(`[alocarEstoqueParaPedidos] Lotes disponíveis para mistura:`, lotesDisponiveis);

                            let lotesMisturados: any[] = [];
                            for (const loteInfo of lotesDisponiveis) {
                                if (quantidadeRestante <= 0) break;

                                const k2 = loteInfo.chave;
                                console.log(`[alocarEstoqueParaPedidos] Tentando alocar do lote ${loteInfo.lote} (disponível: ${loteInfo.disponivel})`);

                                for (const pallet of estoqueEndereco[k2]) {
                                    const quantidadeJaConsumida = palletsConsumidos.get(pallet.id) || 0;
                                    let quantCaixas = Number(pallet.quantCaixas ?? pallet.caixas ?? pallet.produto?.quantCaixas ?? 0);
                                    let quantMinVenda = Number(pallet.quantMinVenda ?? pallet.produto?.quantMinVenda ?? 0);
                                    let palletDisponivel = (quantCaixas * quantMinVenda) - quantidadeJaConsumida;
                                    if (palletDisponivel <= 0) continue;
                                    let consumirPallet = Math.min(quantidadeRestante, palletDisponivel);
                                    if (consumirPallet > 0) {
                                        console.log(`[alocarEstoqueParaPedidos] Alocando ${consumirPallet} do lote ${loteInfo.lote}`);
                                        lotesMisturados.push(buildDetalhe(pallet.lote, 'enderecamento', consumirPallet));
                                        enderecamentosUsados.push({ id: pallet.id, lote: pallet.lote, quantidadeConsumida: consumirPallet });
                                        palletsConsumidos.set(pallet.id, quantidadeJaConsumida + consumirPallet);
                                        disponibilidadeEndereco[k2] -= consumirPallet;
                                        quantidadeRestante -= consumirPallet;
                                        if (quantidadeRestante <= 0) {
                                            break;
                                        }
                                    }
                                }
                            }

                            if (lotesMisturados.length > 0) {
                                status = quantidadeRestante <= 0 ? 'Sucesso - Lote Misturado' : 'Parcialmente Atendido - Lote Misturado';
                                observacao = `Atendido com mistura de ${lotesMisturados.length} lote(s) diferentes no endereçamento.`;
                                console.log(`[alocarEstoqueParaPedidos] Mistura realizada com ${lotesMisturados.length} lote(s)`);
                                detalhes.push(...lotesMisturados);
                            }
                        }

                        // Passo 4: Estoque Insuficiente
                        if (quantidadeRestante > 0 && !status) {
                            status = 'Falha';
                            observacao = 'Estoque insuficiente para o pedido.';
                            console.log(`[alocarEstoqueParaPedidos] FALHA - Pedido ${pedido.pedidoId}: ${pedido.codInterno} não pôde ser atendido. Quantidade restante: ${quantidadeRestante}`);
                            detalhes.push(buildDetalhe('', '', 0));
                        }

                        // Log final do status do pedido
                        if (!status) {
                            status = 'Falha';
                            observacao = 'Pedido não processado corretamente.';
                            console.log(`[alocarEstoqueParaPedidos] ERRO - Pedido ${pedido.pedidoId}: ${pedido.codInterno} passou pelo fluxo sem definir status`);
                        }

                        resultados.push({
                            pedidoId: pedido.pedidoId,
                            status,
                            observacao,
                            detalhes
                        });
                        console.log('[alocarEstoqueParaPedidos] Resultado do pedido:', { pedidoId: pedido.pedidoId, status, observacao });
                        console.log('[alocarEstoqueParaPedidos] Alocação finalizada. Total resultados:', resultados.length);
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
