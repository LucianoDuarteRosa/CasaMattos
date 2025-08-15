export interface IFornecedor {
    id: number;
    razaoSocial: string;
    cnpj: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IProduto {
    id: number;
    codInterno: number;
    descricao: string;
    quantMinVenda: number;
    codBarras?: string;
    deposito: number;
    estoque: number;
    custo?: number;
    codFabricante?: string;
    quantCaixas?: number;
    idFornecedor: number;
    fornecedor?: IFornecedor;
    createdAt?: string;
    updatedAt?: string;
}

export interface IRua {
    id: number;
    nomeRua: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPredio {
    id: number;
    nomePredio: string;
    vagas?: number;
    idRua: number;
    rua?: IRua;
    createdAt?: string;
    updatedAt?: string;
}

export interface ILista {
    id: number;
    nome: string;
    disponivel: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPerfil {
    id: number;
    nomePerfil: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IUsuario {
    id: number;
    nomeCompleto: string;
    nickname: string;
    email: string;
    telefone?: string;
    ativo: boolean;
    idPerfil: number;
    perfil?: IPerfil;
    imagemUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateUsuarioData {
    nomeCompleto: string;
    nickname: string;
    email: string;
    telefone?: string;
    senha: string;
    idPerfil: number;
    imagemUrl?: string;
}

export interface UpdateUsuarioData {
    nomeCompleto?: string;
    nickname?: string;
    email?: string;
    telefone?: string;
    ativo?: boolean;
    idPerfil?: number;
    imagemUrl?: string;
}

export interface UpdateUsuarioSenhaData {
    senhaAtual: string;
    novaSenha: string;
}

export interface IEnderecamento {
    id: number;
    tonalidade: string;
    bitola: string;
    lote?: string;
    observacao?: string;
    quantCaixas?: number;
    disponivel: boolean;
    idProduto: number;
    idLista?: number;
    idPredio: number;
    produto?: IProduto;
    lista?: ILista;
    predio?: IPredio;
    createdAt?: string;
    updatedAt?: string;
}

export interface ILoginRequest {
    email: string;
    senha: string;
}

export interface ILoginResponse {
    token: string;
    usuario: IUsuario;
}

export interface IApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

export interface IPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IEstoqueItem {
    id: number;
    produtoId: number;
    lote: string;
    ton: string;
    bit: string;
    quantidade: number;
    createdAt?: string;
    updatedAt?: string;
}
