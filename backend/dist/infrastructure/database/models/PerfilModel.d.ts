import { Model } from 'sequelize';
export interface PerfilAttributes {
    id: number;
    nomePerfil: string;
}
export interface PerfilCreationAttributes extends Omit<PerfilAttributes, 'id'> {
}
declare class PerfilModel extends Model<PerfilAttributes, PerfilCreationAttributes> implements PerfilAttributes {
    id: number;
    nomePerfil: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default PerfilModel;
//# sourceMappingURL=PerfilModel.d.ts.map