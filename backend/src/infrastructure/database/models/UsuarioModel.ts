import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

export interface UsuarioAttributes {
    id: number;
    nomeCompleto: string;
    nickname: string;
    email: string;
    telefone?: string;
    senha: string;
    ativo: boolean;
    idPerfil: number;
    imagemUrl?: string;
}

export interface UsuarioCreationAttributes extends Omit<UsuarioAttributes, 'id'> { }

class UsuarioModel extends Model<UsuarioAttributes, UsuarioCreationAttributes>
    implements UsuarioAttributes {
    public id!: number;
    public nomeCompleto!: string;
    public nickname!: string;
    public email!: string;
    public telefone?: string;
    public senha!: string;
    public ativo!: boolean;
    public idPerfil!: number;
    public imagemUrl?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

UsuarioModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nomeCompleto: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        senha: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        idPerfil: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Perfis',
                key: 'id',
            },
        },
        imagemUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'Usuarios',
    }
);

export default UsuarioModel;
