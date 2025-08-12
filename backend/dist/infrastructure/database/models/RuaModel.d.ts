import { Model } from 'sequelize';
export interface RuaAttributes {
    id: number;
    nomeRua: string;
}
export interface RuaCreationAttributes extends Omit<RuaAttributes, 'id'> {
}
declare class RuaModel extends Model<RuaAttributes, RuaCreationAttributes> implements RuaAttributes {
    id: number;
    nomeRua: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default RuaModel;
//# sourceMappingURL=RuaModel.d.ts.map