import { Model } from 'sequelize';
export interface UsuarioAttributes {
    id: number;
    nomeCompleto: string;
    nickname: string;
    email: string;
    telefone?: string;
    senha: string;
    ativo: boolean;
    idPerfil: number;
}
export interface UsuarioCreationAttributes extends Omit<UsuarioAttributes, 'id'> {
}
declare class UsuarioModel extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
    id: number;
    nomeCompleto: string;
    nickname: string;
    email: string;
    telefone?: string;
    senha: string;
    ativo: boolean;
    idPerfil: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default UsuarioModel;
//# sourceMappingURL=UsuarioModel.d.ts.map