import { Model } from 'sequelize';
export interface FornecedorAttributes {
    id: number;
    razaoSocial: string;
    cnpj: string;
}
export interface FornecedorCreationAttributes extends Omit<FornecedorAttributes, 'id'> {
}
declare class FornecedorModel extends Model<FornecedorAttributes, FornecedorCreationAttributes> implements FornecedorAttributes {
    id: number;
    razaoSocial: string;
    cnpj: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default FornecedorModel;
//# sourceMappingURL=FornecedorModel.d.ts.map