import { Model } from 'sequelize';
export interface ProdutoAttributes {
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
}
export interface ProdutoCreationAttributes extends Omit<ProdutoAttributes, 'id'> {
}
declare class ProdutoModel extends Model<ProdutoAttributes, ProdutoCreationAttributes> implements ProdutoAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default ProdutoModel;
//# sourceMappingURL=ProdutoModel.d.ts.map