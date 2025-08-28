import { Request, Response } from 'express';
import { FornecedorRepository } from '../../infrastructure/repositories/FornecedorRepository';
import { CreateFornecedorUseCase } from '../../application/usecases/CreateFornecedorUseCase';
import { UpdateFornecedorUseCase } from '../../application/usecases/UpdateFornecedorUseCase';
import { parseFornecedoresExcel, sanitizeCnpj, isCnpjValid } from '../../utils/fornecedorImportUtils';
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
                const { parseProdutosExcel, sanitizeCnpj, isCnpjValid } = await import('../../utils/fornecedorImportUtils');
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
                    let quantidadeMinimaVenda = safeString(row.QuantidadeMinimaVenda || row.Quantidade_Minima_Venda || row.QtdMinimaVenda || row.Qtd_Minima_Venda);
                    let estoque = safeString(row.Estoque || row.QuantidadeEstoque || row.QtdEstoque || row.Qtd_Estoque);
                    let custo = safeString(row.Custo || row.PrecoCusto || row.Preco_Custo);
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
                                observacao += 'Fornecedor e produto serão cadastrados na confirmação.';
                            } else if (!fornecedor) {
                                observacao += 'Fornecedor será cadastrado na confirmação.';
                                observacao += produtoExistente ? ' Produto será atualizado!' : ' Produto será cadastrado!';
                            } else if (!produtoExistente) {
                                observacao += 'Produto será cadastrado na confirmação.';
                            } else {
                                observacao += 'Produto será atualizado!';
                            }
                        }
                        if (status !== 'Sucesso') status = 'Falha';
                        resultados.push({
                            id: seqId++, // id sequencial provisório
                            codInterno,
                            descricao,
                            cnpjFornecedor: isCnpjValid(cnpjNumerico) ? maskCnpj(cnpjNumerico) : cnpjOriginal,
                            fornecedor: fornecedorNome,
                            razaoSocial,
                            status,
                            observacao,
                            preco,
                            quantidade,
                            quantidadeMinimaVenda,
                            estoque,
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
            const { sanitizeCnpj, isCnpjValid } = await import('../../utils/fornecedorImportUtils');
            const { executorUserId } = (await import('../../utils/requestHelpers')).extractRequestContext(req);

            let adicionados = 0;
            let atualizados = 0;
            for (const row of produtos) {
                const codInterno = row.codInterno;
                const descricao = row.descricao;
                const cnpjNumerico = sanitizeCnpj(row.cnpjFornecedor);
                let fornecedor = await fornecedorRepository.findByCNPJ(cnpjNumerico);
                if (!fornecedor) {
                    // tenta buscar com máscara
                    fornecedor = await fornecedorRepository.findByCNPJ(row.cnpjFornecedor);
                }
                if (!fornecedor && isCnpjValid(cnpjNumerico)) {
                    fornecedor = await fornecedorRepository.create({ cnpj: row.cnpjFornecedor, razaoSocial: row.razaoSocial });
                }
                let produtoExistente = await produtoRepository.findByCodInterno(codInterno);
                if (produtoExistente) {
                    await updateProdutoUseCase.execute(produtoExistente.id, { ...row, fornecedorId: fornecedor?.id, executorUserId });
                    atualizados++;
                } else {
                    await createProdutoUseCase.execute({ ...row, fornecedorId: fornecedor?.id, executorUserId });
                    adicionados++;
                }
            }
            return res.json({
                message: `Importação concluída com sucesso! ${adicionados} produto(s) adicionado(s), ${atualizados} atualizado(s).`,
                adicionados,
                atualizados
            });
        } catch (err) {
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
        // Implementar importação de separação
        return res.json({ message: 'Importação de separação chamada' });
    }
}
