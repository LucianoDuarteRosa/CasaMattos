import { Model } from 'sequelize';
export interface EnderecamentoAttributes {
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
}
export interface EnderecamentoCreationAttributes extends Omit<EnderecamentoAttributes, 'id'> {
}
declare class EnderecamentoModel extends Model<EnderecamentoAttributes, EnderecamentoCreationAttributes> implements EnderecamentoAttributes {
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
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default EnderecamentoModel;
//# sourceMappingURL=EnderecamentoModel.d.ts.map