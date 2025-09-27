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

            try {
                const separacoes = parseSeparacaoExcel(buffer) || [];
                const produtoRepoModule = await import('../../infrastructure/repositories/ProdutoRepository');
                const produtoRepository = new produtoRepoModule.ProdutoRepository();

                type StatusResultado = 'Sucesso' | 'Falha' | 'Pendente';
                type DetalheResultado = {
                    codInterno: string;
                    descricao: string;
                    codFabricante: string;
                    tonalidade: string;
                    bitola: string;
                    quantMinimaVenda: string;
                    quantidadeCaixas: string;
                    quantidadeTotal: string;
                    quantidade: string;
                    lote: string;
                    fonte: string;
                    quantidadeAlocada: number;
                    observacao: string;
                    status: StatusResultado;
                    referenciaId?: number;
                };
                interface ResultadoSeparacao {
                    id: number;
                    pedidoId: number;
                    codInterno: string;
                    descricao: string;
                    codFabricante: string;
                    tonalidade: string;
                    bitola: string;
                    quantMinimaVenda: number;
                    quantidadeCaixas: number;
                    quantidadeTotal: number;
                    quantidade: number;
                    lote: string;
                    rotaPedido: string;
                    status: StatusResultado;
                    observacao: string;
                    detalhes: DetalheResultado[];
                }
                interface PedidoSeparacao {
                    pedidoId: number;
                    resultadoIndex: number;
                    produtoId: number;
                    codInterno: string;
                    descricao: string;
                    codFabricante: string;
                    tonalidade: string;
                    bitola: string;
                    lote: string;
                    quantMinimaVenda: number;
                    quantidadeCaixas: number;
                    quantidadeTotal: number;
                    quantidade: number;
                    rotaPedido: string;
                    atendidoSetor: number;
                    atendidoEnderecamento: number;
                    restante: number;
                    statusInicial: StatusResultado;
                    detalhes: DetalheResultado[];
                }

                interface EnderecamentoUso {
                    id?: number;
                    pedidoId: number;
                    produtoId: number;
                    codInterno: string;
                    descricao: string;
                    tonalidade: string;
                    bitola: string;
                    lote: string;
                    quantidadeConsumida: number;
                    fontes: string[];
                    rotaPedido: string;
                }

                function safeString(val: any) {
                    if (val === undefined || val === null) return '';
                    if (typeof val === 'string') return val.trim();
                    if (typeof val === 'number') return String(val).trim();
                    return String(val).trim();
                }

                function normalize(val: any) {
                    return (val === undefined || val === null) ? '' : String(val).trim().toUpperCase();
                }

                function buildDetalhe(
                    pedido: PedidoSeparacao,
                    fonte: string,
                    loteOrigem: string,
                    quantidadeAlocada: number,
                    statusDetalhe: StatusResultado,
                    observacaoDetalhe: string,
                    referenciaId?: number
                ): DetalheResultado {
                    const loteFinal = loteOrigem && loteOrigem !== '' ? loteOrigem : pedido.lote;
                    return {
                        codInterno: safeString(pedido.codInterno),
                        descricao: safeString(pedido.descricao),
                        codFabricante: safeString(pedido.codFabricante),
                        tonalidade: safeString(pedido.tonalidade),
                        bitola: safeString(pedido.bitola),
                        quantMinimaVenda: safeString(pedido.quantMinimaVenda),
                        quantidadeCaixas: safeString(pedido.quantidadeCaixas),
                        quantidadeTotal: safeString(pedido.quantidadeTotal),
                        quantidade: safeString(pedido.quantidade),
                        lote: safeString(loteFinal),
                        fonte: safeString(fonte),
                        quantidadeAlocada: Number(quantidadeAlocada) || 0,
                        observacao: safeString(observacaoDetalhe),
                        status: statusDetalhe,
                        referenciaId
                    };
                }

                const resultados: ResultadoSeparacao[] = [];
                const pedidos: PedidoSeparacao[] = [];

                let seqId = 1;
                for (const row of separacoes) {
                    const codInternoStr = safeString(row.CodProduto || row.CodInterno);
                    const codInternoNum = Number(codInternoStr);
                    const descricaoPlano = safeString(row.Descricao);
                    const tonalidade = normalize(row.Tonalidade);
                    const bitola = normalize(row.Bitola);
                    const lote = normalize(row.Lote);
                    const quantidadeCaixasPlano = Number(row.Quantidade) || 0;
                    const rotaPedido = safeString(row['Rota Pedido'] || row.RotaPedido);
                    const quantMinimaVendaPlanilha = Number(row.QuantMinimaVenda) || 0;

                    const resultadoBase: ResultadoSeparacao = {
                        id: seqId,
                        pedidoId: seqId,
                        codInterno: codInternoStr,
                        descricao: descricaoPlano,
                        codFabricante: safeString(row.CodFabricante),
                        tonalidade,
                        bitola,
                        quantMinimaVenda: quantMinimaVendaPlanilha,
                        quantidadeCaixas: quantidadeCaixasPlano,
                        quantidadeTotal: quantidadeCaixasPlano * (quantMinimaVendaPlanilha > 0 ? quantMinimaVendaPlanilha : 0),
                        quantidade: quantidadeCaixasPlano * (quantMinimaVendaPlanilha > 0 ? quantMinimaVendaPlanilha : 0),
                        lote,
                        rotaPedido,
                        status: 'Pendente',
                        observacao: '',
                        detalhes: []
                    };

                    const resultadoIndex = resultados.push(resultadoBase) - 1;

                    if (!codInternoStr) {
                        resultados[resultadoIndex].status = 'Falha';
                        resultados[resultadoIndex].observacao = 'Código interno não informado na planilha.';
                        seqId++;
                        continue;
                    }

                    if (Number.isNaN(codInternoNum) || codInternoNum <= 0) {
                        resultados[resultadoIndex].status = 'Falha';
                        resultados[resultadoIndex].observacao = 'Código interno inválido.';
                        seqId++;
                        continue;
                    }

                    const produto = await produtoRepository.findByCodInterno(codInternoNum);
                    if (!produto) {
                        resultados[resultadoIndex].status = 'Falha';
                        resultados[resultadoIndex].observacao = 'Produto não localizado na base.';
                        seqId++;
                        continue;
                    }

                    const quantMinimaVenda = quantMinimaVendaPlanilha > 0 ? quantMinimaVendaPlanilha : Number(produto.quantMinVenda) || 0;
                    if (quantMinimaVenda <= 0) {
                        resultados[resultadoIndex].status = 'Falha';
                        resultados[resultadoIndex].observacao = 'Quantidade mínima de venda não informada.';
                        seqId++;
                        continue;
                    }

                    const quantidadeTotal = quantidadeCaixasPlano * quantMinimaVenda;
                    if (quantidadeTotal <= 0) {
                        resultados[resultadoIndex].status = 'Falha';
                        resultados[resultadoIndex].observacao = 'Quantidade solicitada inválida.';
                        seqId++;
                        continue;
                    }

                    resultados[resultadoIndex] = {
                        ...resultados[resultadoIndex],
                        descricao: descricaoPlano || produto.descricao || '',
                        codFabricante: safeString(row.CodFabricante) || produto.codFabricante || '',
                        quantMinimaVenda,
                        quantidadeCaixas: quantidadeCaixasPlano,
                        quantidadeTotal,
                        quantidade: quantidadeTotal,
                    };

                    pedidos.push({
                        pedidoId: seqId,
                        resultadoIndex,
                        produtoId: produto.id,
                        codInterno: String(produto.codInterno ?? codInternoStr),
                        descricao: descricaoPlano || produto.descricao || '',
                        codFabricante: safeString(row.CodFabricante) || produto.codFabricante || '',
                        tonalidade,
                        bitola,
                        lote,
                        quantMinimaVenda,
                        quantidadeCaixas: quantidadeCaixasPlano,
                        quantidadeTotal,
                        quantidade: quantidadeTotal,
                        rotaPedido,
                        atendidoSetor: 0,
                        atendidoEnderecamento: 0,
                        restante: quantidadeTotal,
                        statusInicial: 'Pendente',
                        detalhes: []
                    });

                    seqId++;
                }

                let enderecamentosUsados: EnderecamentoUso[] = [];

                if (pedidos.length > 0) {
                    const estoqueItemRepoModule = await import('../../infrastructure/repositories/EstoqueItemRepository');
                    const enderecamentoRepoModule = await import('../../infrastructure/repositories/EnderecamentoRepository');
                    const estoqueItemRepository = new estoqueItemRepoModule.EstoqueItemRepository();
                    const enderecamentoRepository = new enderecamentoRepoModule.EnderecamentoRepository();

                    const enderecamentosUsadosMap = new Map<string, EnderecamentoUso>();
                    const registrarEnderecamentoUso = (
                        pedido: PedidoSeparacao,
                        fonte: string,
                        loteOrigem: string,
                        quantidadeConsumida: number,
                        registroId?: number
                    ) => {
                        if (quantidadeConsumida <= 0) {
                            return;
                        }
                        const loteFinalNormalizado = normalize(loteOrigem) || pedido.lote;
                        const key = [registroId ?? 'sem-id', pedido.pedidoId, loteFinalNormalizado].join('|');
                        const existente = enderecamentosUsadosMap.get(key);
                        if (existente) {
                            existente.quantidadeConsumida += quantidadeConsumida;
                            if (!existente.fontes.includes(fonte)) {
                                existente.fontes.push(fonte);
                            }
                            return;
                        }
                        enderecamentosUsadosMap.set(key, {
                            id: registroId,
                            pedidoId: pedido.pedidoId,
                            produtoId: pedido.produtoId,
                            codInterno: pedido.codInterno,
                            descricao: pedido.descricao,
                            tonalidade: pedido.tonalidade,
                            bitola: pedido.bitola,
                            lote: loteFinalNormalizado,
                            quantidadeConsumida,
                            fontes: [fonte],
                            rotaPedido: pedido.rotaPedido
                        });
                    };

                    const [estoqueItens, enderecamentos] = await Promise.all([
                        estoqueItemRepository.findAll(),
                        enderecamentoRepository.findAll()
                    ]);

                    const keyFrom = (produtoId: number, ton: string, bit: string, loteKey: string) => {
                        return [produtoId, normalize(ton), normalize(bit), normalize(loteKey)].join('|');
                    };

                    const parseKey = (key: string) => {
                        const [produtoIdStr, ton, bit, loteKey] = key.split('|');
                        return {
                            produtoId: Number(produtoIdStr),
                            ton,
                            bit,
                            lote: loteKey
                        };
                    };

                    const estoqueSetorDisponivel = new Map<string, number>();
                    for (const item of estoqueItens) {
                        const key = keyFrom(item.produtoId, item.ton, item.bit, item.lote || '');
                        const atual = estoqueSetorDisponivel.get(key) || 0;
                        const quantidade = Number(item.quantidade) || 0;
                        if (quantidade <= 0) continue;
                        estoqueSetorDisponivel.set(key, atual + quantidade);
                    }

                    const enderecamentoDisponivel = new Map<string, Array<{ id?: number; restante: number; quantCaixas: number; quantMinPadrao: number }>>();
                    for (const end of enderecamentos) {
                        if (!end.disponivel) continue;
                        const key = keyFrom(end.idProduto, end.tonalidade, end.bitola, end.lote || '');
                        const quantCaixas = Number(end.quantCaixas ?? 0);
                        const quantMinVendaProduto = Number(end.produto?.quantMinVenda ?? 0);
                        if (quantCaixas <= 0) continue;
                        const capacidade = quantCaixas * (quantMinVendaProduto > 0 ? quantMinVendaProduto : 0);
                        const lista = enderecamentoDisponivel.get(key) || [];
                        lista.push({ id: end.id, restante: capacidade, quantCaixas, quantMinPadrao: quantMinVendaProduto });
                        enderecamentoDisponivel.set(key, lista);
                    }

                    for (const pedido of pedidos) {
                        const resultadoRef = resultados[pedido.resultadoIndex];
                        if (resultadoRef.status === 'Falha') {
                            pedido.statusInicial = 'Falha';
                            continue;
                        }

                        const key = keyFrom(pedido.produtoId, pedido.tonalidade, pedido.bitola, pedido.lote);
                        let necessario = pedido.quantidadeTotal;
                        let consumidoSetor = 0;
                        let consumidoEndereco = 0;
                        const detalhes: DetalheResultado[] = [];

                        const setorDisponivel = estoqueSetorDisponivel.get(key) || 0;
                        if (setorDisponivel > 0 && necessario > 0) {
                            const consumir = Math.min(setorDisponivel, necessario);
                            if (consumir > 0) {
                                consumidoSetor += consumir;
                                necessario -= consumir;
                                estoqueSetorDisponivel.set(key, setorDisponivel - consumir);
                                detalhes.push(
                                    buildDetalhe(
                                        pedido,
                                        'Estoque (mesmo lote)',
                                        pedido.lote,
                                        consumir,
                                        'Sucesso',
                                        'Atendido com estoque no setor (mesmo lote).'
                                    )
                                );
                            }
                        }

                        if (necessario > 0) {
                            const listaEnderecos = enderecamentoDisponivel.get(key) || [];
                            for (const registro of listaEnderecos) {
                                if (necessario <= 0) break;
                                if (registro.restante <= 0 && registro.quantMinPadrao <= 0) {
                                    registro.restante = registro.quantCaixas * pedido.quantMinimaVenda;
                                }
                                if (registro.restante <= 0) continue;
                                const consumir = Math.min(registro.restante, necessario);
                                if (consumir <= 0) continue;
                                consumidoEndereco += consumir;
                                necessario -= consumir;
                                registro.restante -= consumir;
                                detalhes.push(
                                    buildDetalhe(
                                        pedido,
                                        'Endereçamento (mesmo lote)',
                                        pedido.lote,
                                        consumir,
                                        'Sucesso',
                                        'Atendido no endereçamento (mesmo lote).',
                                        registro.id
                                    )
                                );
                                registrarEnderecamentoUso(
                                    pedido,
                                    'Endereçamento (mesmo lote)',
                                    pedido.lote,
                                    consumir,
                                    registro.id
                                );
                            }
                        }

                        pedido.atendidoSetor = consumidoSetor;
                        pedido.atendidoEnderecamento = consumidoEndereco;
                        pedido.restante = necessario;
                        pedido.detalhes = detalhes;

                        if (necessario <= 0) {
                            resultadoRef.status = 'Sucesso';
                            resultadoRef.observacao = consumidoEndereco > 0
                                ? 'Atendido com estoque do mesmo lote utilizando setor e endereçamento.'
                                : 'Atendido com estoque do mesmo lote no setor.';
                        } else if ((consumidoSetor + consumidoEndereco) > 0) {
                            resultadoRef.status = 'Pendente';
                            resultadoRef.observacao = 'Atendimento parcial com estoque do mesmo lote. Necessário complementar em outras fontes.';
                        } else {
                            resultadoRef.status = 'Pendente';
                            resultadoRef.observacao = 'Saldo indisponível no mesmo lote. Necessário verificar outros lotes.';
                        }

                        resultadoRef.detalhes = detalhes;
                        pedido.statusInicial = resultadoRef.status;
                    }

                    const pedidosPendentes = pedidos.filter(p => resultados[p.resultadoIndex].status !== 'Falha' && p.restante > 0);

                    for (const pedido of pedidosPendentes) {
                        let necessario = pedido.restante;
                        if (necessario <= 0) continue;

                        const resultadoRef = resultados[pedido.resultadoIndex];
                        const detalhesExtras: DetalheResultado[] = [];
                        let consumidoSetorExtra = 0;
                        let consumidoEnderecoExtra = 0;

                        const pedidoProdutoId = pedido.produtoId;
                        const pedidoTon = normalize(pedido.tonalidade);
                        const pedidoBit = normalize(pedido.bitola);
                        const pedidoLoteOriginal = normalize(pedido.lote);

                        const candidateSetorKeys = Array.from(estoqueSetorDisponivel.entries()).filter(([key, disponibilidade]) => {
                            if ((disponibilidade || 0) <= 0) return false;
                            const parts = parseKey(key);
                            return parts.produtoId === pedidoProdutoId &&
                                parts.ton === pedidoTon &&
                                parts.bit === pedidoBit &&
                                parts.lote !== pedidoLoteOriginal;
                        });

                        for (const [key] of candidateSetorKeys) {
                            if (necessario <= 0) break;
                            const parts = parseKey(key);
                            let disponibilidade = estoqueSetorDisponivel.get(key) || 0;
                            if (disponibilidade <= 0) continue;
                            const consumir = Math.min(disponibilidade, necessario);
                            if (consumir <= 0) continue;
                            estoqueSetorDisponivel.set(key, disponibilidade - consumir);
                            necessario -= consumir;
                            consumidoSetorExtra += consumir;
                            detalhesExtras.push(
                                buildDetalhe(
                                    pedido,
                                    'Estoque (outro lote)',
                                    parts.lote,
                                    consumir,
                                    'Sucesso',
                                    'Atendido com estoque do setor em lote alternativo.'
                                )
                            );

                            if (necessario > 0) {
                                const listaEnd = enderecamentoDisponivel.get(key) || [];
                                for (const registro of listaEnd) {
                                    if (necessario <= 0) break;
                                    if (registro.restante <= 0 && registro.quantMinPadrao <= 0) {
                                        registro.restante = registro.quantCaixas * pedido.quantMinimaVenda;
                                    }
                                    if (registro.restante <= 0) continue;
                                    const consumirEndereco = Math.min(registro.restante, necessario);
                                    if (consumirEndereco <= 0) continue;
                                    registro.restante -= consumirEndereco;
                                    necessario -= consumirEndereco;
                                    consumidoEnderecoExtra += consumirEndereco;
                                    detalhesExtras.push(
                                        buildDetalhe(
                                            pedido,
                                            'Endereçamento (mesmo lote do setor)',
                                            parts.lote,
                                            consumirEndereco,
                                            'Sucesso',
                                            'Atendido no endereçamento associado ao lote alternativo.',
                                            registro.id
                                        )
                                    );
                                    registrarEnderecamentoUso(
                                        pedido,
                                        'Endereçamento (mesmo lote do setor)',
                                        parts.lote,
                                        consumirEndereco,
                                        registro.id
                                    );
                                }
                            }
                        }

                        if (necessario > 0) {
                            const candidateEndKeys = Array.from(enderecamentoDisponivel.entries()).filter(([key, lista]) => {
                                const parts = parseKey(key);
                                if (parts.produtoId !== pedidoProdutoId) return false;
                                if (parts.ton !== pedidoTon || parts.bit !== pedidoBit) return false;
                                if (parts.lote === pedidoLoteOriginal) return false;
                                return lista.some(registro => registro.restante > 0 || (registro.quantMinPadrao <= 0 && registro.quantCaixas > 0));
                            });

                            for (const [key, lista] of candidateEndKeys) {
                                if (necessario <= 0) break;
                                const parts = parseKey(key);
                                for (const registro of lista) {
                                    if (necessario <= 0) break;
                                    if (registro.restante <= 0 && registro.quantMinPadrao <= 0) {
                                        registro.restante = registro.quantCaixas * pedido.quantMinimaVenda;
                                    }
                                    if (registro.restante <= 0) continue;
                                    const consumirEndereco = Math.min(registro.restante, necessario);
                                    if (consumirEndereco <= 0) continue;
                                    registro.restante -= consumirEndereco;
                                    necessario -= consumirEndereco;
                                    consumidoEnderecoExtra += consumirEndereco;
                                    detalhesExtras.push(
                                        buildDetalhe(
                                            pedido,
                                            'Endereçamento (outro lote)',
                                            parts.lote,
                                            consumirEndereco,
                                            'Sucesso',
                                            'Atendido no endereçamento em lote alternativo.',
                                            registro.id
                                        )
                                    );
                                    registrarEnderecamentoUso(
                                        pedido,
                                        'Endereçamento (outro lote)',
                                        parts.lote,
                                        consumirEndereco,
                                        registro.id
                                    );
                                }
                            }
                        }

                        if (necessario > 0) {
                            const candidateSetorKeysByBit = Array.from(estoqueSetorDisponivel.entries()).filter(([key, disponibilidade]) => {
                                if ((disponibilidade || 0) <= 0) return false;
                                const parts = parseKey(key);
                                return parts.produtoId === pedidoProdutoId && parts.bit === pedidoBit && parts.ton !== pedidoTon;
                            });

                            for (const [key] of candidateSetorKeysByBit) {
                                if (necessario <= 0) break;
                                const parts = parseKey(key);
                                let disponibilidade = estoqueSetorDisponivel.get(key) || 0;
                                if (disponibilidade <= 0) continue;
                                const consumir = Math.min(disponibilidade, necessario);
                                if (consumir <= 0) continue;
                                estoqueSetorDisponivel.set(key, disponibilidade - consumir);
                                necessario -= consumir;
                                consumidoSetorExtra += consumir;
                                detalhesExtras.push(
                                    buildDetalhe(
                                        pedido,
                                        'Estoque (outra tonalidade)',
                                        parts.lote,
                                        consumir,
                                        'Sucesso',
                                        'Atendido com estoque do setor em outra tonalidade.'
                                    )
                                );

                                if (necessario > 0) {
                                    const listaEnd = enderecamentoDisponivel.get(key) || [];
                                    for (const registro of listaEnd) {
                                        if (necessario <= 0) break;
                                        if (registro.restante <= 0 && registro.quantMinPadrao <= 0) {
                                            registro.restante = registro.quantCaixas * pedido.quantMinimaVenda;
                                        }
                                        if (registro.restante <= 0) continue;
                                        const consumirEndereco = Math.min(registro.restante, necessario);
                                        if (consumirEndereco <= 0) continue;
                                        registro.restante -= consumirEndereco;
                                        necessario -= consumirEndereco;
                                        consumidoEnderecoExtra += consumirEndereco;
                                        detalhesExtras.push(
                                            buildDetalhe(
                                                pedido,
                                                'Endereçamento (outra tonalidade vinculada)',
                                                parts.lote,
                                                consumirEndereco,
                                                'Sucesso',
                                                'Atendido no endereçamento em outra tonalidade vinculada.',
                                                registro.id
                                            )
                                        );
                                        registrarEnderecamentoUso(
                                            pedido,
                                            'Endereçamento (outra tonalidade vinculada)',
                                            parts.lote,
                                            consumirEndereco,
                                            registro.id
                                        );
                                    }
                                }
                            }
                        }

                        if (necessario > 0) {
                            const candidateEndKeysByBit = Array.from(enderecamentoDisponivel.entries()).filter(([key, lista]) => {
                                const parts = parseKey(key);
                                if (parts.produtoId !== pedidoProdutoId) return false;
                                if (parts.bit !== pedidoBit) return false;
                                if (parts.ton === pedidoTon && parts.lote === pedidoLoteOriginal) return false;
                                return lista.some(registro => registro.restante > 0 || (registro.quantMinPadrao <= 0 && registro.quantCaixas > 0));
                            });

                            for (const [key, lista] of candidateEndKeysByBit) {
                                if (necessario <= 0) break;
                                const parts = parseKey(key);
                                for (const registro of lista) {
                                    if (necessario <= 0) break;
                                    if (registro.restante <= 0 && registro.quantMinPadrao <= 0) {
                                        registro.restante = registro.quantCaixas * pedido.quantMinimaVenda;
                                    }
                                    if (registro.restante <= 0) continue;
                                    const consumirEndereco = Math.min(registro.restante, necessario);
                                    if (consumirEndereco <= 0) continue;
                                    registro.restante -= consumirEndereco;
                                    necessario -= consumirEndereco;
                                    consumidoEnderecoExtra += consumirEndereco;
                                    detalhesExtras.push(
                                        buildDetalhe(
                                            pedido,
                                            'Endereçamento (outra tonalidade)',
                                            parts.lote,
                                            consumirEndereco,
                                            'Sucesso',
                                            'Atendido no endereçamento em outra tonalidade.',
                                            registro.id
                                        )
                                    );
                                    registrarEnderecamentoUso(
                                        pedido,
                                        'Endereçamento (outra tonalidade)',
                                        parts.lote,
                                        consumirEndereco,
                                        registro.id
                                    );
                                }
                            }
                        }

                        pedido.atendidoSetor += consumidoSetorExtra;
                        pedido.atendidoEnderecamento += consumidoEnderecoExtra;
                        pedido.restante = necessario;
                        pedido.detalhes = [...pedido.detalhes, ...detalhesExtras];
                        resultadoRef.detalhes = [...resultadoRef.detalhes, ...detalhesExtras];

                        const totalAtendido = pedido.quantidadeTotal - necessario;
                        if (necessario <= 0) {
                            resultadoRef.status = 'Sucesso';
                            resultadoRef.observacao = (pedido.atendidoEnderecamento > 0)
                                ? 'Atendido com estoque utilizando lotes alternativos.'
                                : 'Atendido com estoque do setor em lotes alternativos.';
                        } else if (totalAtendido > 0) {
                            resultadoRef.status = 'Pendente';
                            resultadoRef.observacao = 'Atendimento parcial após buscar lotes alternativos. Verificar saldo restante.';
                        } else {
                            resultadoRef.status = 'Falha';
                            resultadoRef.observacao = 'Estoque insuficiente.';
                        }

                        pedido.statusInicial = resultadoRef.status;
                    }
                    enderecamentosUsados = Array.from(enderecamentosUsadosMap.values());
                }

                for (const pedido of pedidos) {
                    const resultadoRef = resultados[pedido.resultadoIndex];
                    if (!resultadoRef.detalhes || resultadoRef.detalhes.length === 0) {
                        const statusFinal: StatusResultado = resultadoRef.status === 'Falha' ? 'Falha' : 'Pendente';
                        const observacaoFinal = resultadoRef.observacao || (statusFinal === 'Falha' ? 'Estoque insuficiente.' : 'Sem alocação registrada.');
                        const detalheFallback = buildDetalhe(
                            pedido,
                            'Sem alocação',
                            pedido.lote,
                            0,
                            statusFinal,
                            observacaoFinal
                        );
                        resultadoRef.detalhes = [detalheFallback];
                        pedido.detalhes = resultadoRef.detalhes;
                    }
                }

                return res.json({ resultados, pedidos, enderecamentosUsados });
            } catch (innerErr) {
                console.error('Erro ao processar separação:', innerErr);
                return res.status(500).json({ message: 'Erro ao processar arquivo de separação', error: (innerErr as Error).message });
            }
        } catch (err) {
            console.error('Erro inesperado em importarSeparacao:', err);
            return res.status(500).json({ message: 'Erro ao importar separação', error: (err as Error).message });
        }
    }

    async confirmarImportacaoSeparacao(req: Request, res: Response) {
        try {
            const pedidos = Array.isArray(req.body?.pedidos) ? req.body.pedidos : [];
            const enderecamentos = Array.isArray(req.body?.enderecamentos) ? req.body.enderecamentos : [];

            if (!pedidos.length) {
                return res.status(400).json({ message: 'Nenhum pedido informado para confirmação.' });
            }

            const { executorUserId } = extractRequestContext(req);
            const totalAlocado = enderecamentos.reduce((acc: number, item: any) => {
                const quantidade = Number(item?.quantidadeConsumida ?? item?.quantidade ?? 0);
                return acc + (Number.isFinite(quantidade) ? quantidade : 0);
            }, 0);

            // TODO: Implementar persistência dos dados de separação conforme regras de negócio definidas.

            return res.json({
                message: 'Confirmação de importação de separação recebida com sucesso.',
                pedidosProcessados: pedidos.length,
                enderecamentosRecebidos: enderecamentos.length,
                totalAlocado,
                executorUserId
            });
        } catch (err) {
            console.error('Erro ao confirmar importação de separação:', err);
            return res.status(500).json({ message: 'Erro ao confirmar importação de separação', error: (err as Error).message });
        }
    }
}
