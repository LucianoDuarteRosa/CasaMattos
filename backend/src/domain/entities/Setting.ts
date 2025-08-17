// Modelo genérico de configuração
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../infrastructure/database/connection';

class Setting extends Model {
    public id!: number;
    public key!: string;
    public value!: string;
    public type!: string; // Ex: 'smtp', 'outro_tipo'
    public active!: boolean;
}

Setting.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'Setting',
        tableName: 'Settings',
        timestamps: true,
    }
);

export default Setting;
