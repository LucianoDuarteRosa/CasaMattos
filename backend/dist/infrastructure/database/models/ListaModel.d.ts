import { Model } from 'sequelize';
export interface ListaAttributes {
    id: number;
    nome: string;
    disponivel: boolean;
}
export interface ListaCreationAttributes extends Omit<ListaAttributes, 'id'> {
}
declare class ListaModel extends Model<ListaAttributes, ListaCreationAttributes> implements ListaAttributes {
    id: number;
    nome: string;
    disponivel: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default ListaModel;
//# sourceMappingURL=ListaModel.d.ts.map