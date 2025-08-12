import { Model } from 'sequelize';
export interface PredioAttributes {
    id: number;
    nomePredio: string;
    vagas?: number;
    idRua: number;
}
export interface PredioCreationAttributes extends Omit<PredioAttributes, 'id'> {
}
declare class PredioModel extends Model<PredioAttributes, PredioCreationAttributes> implements PredioAttributes {
    id: number;
    nomePredio: string;
    vagas?: number;
    idRua: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default PredioModel;
//# sourceMappingURL=PredioModel.d.ts.map