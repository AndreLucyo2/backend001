import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class Address extends Model {
    public uid!: string;
    public personUid!: string; // FK para Person
    public street!: string;
    public number!: string;
    public neighborhood!: string;
    public zipCode!: string;
    public city!: string;
    public state!: string;
    public country!: string;
    public observation!: string;
    public isPrimary!: boolean; // Campo para definir endereço principal
    public isActive!: boolean;
    public createdByUserUid!: string;
    public readonly createdAt!: Date;
    public updatedByUserUid!: string;
    public readonly updatedAt!: Date;
}

Address.init(
    {
        uid: {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4().toUpperCase(),
            primaryKey: true,
            set(value: string) {
                this.setDataValue('uid', value?.toUpperCase());
            }
        },
        personUid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'persons', key: 'uid' },
            onDelete: 'CASCADE', // Se person for deletada, endereços também são
            onUpdate: 'CASCADE'
        },
        street: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        neighborhood: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        zipCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Brasil'
        },
        observation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        createdByUserUid: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'users', key: 'uid' }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedByUserUid: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: 'users', key: 'uid' }
        },
    },
    {
        sequelize,
        tableName: 'addresses',
        indexes: [
            {
                fields: ['personUid'] // Index para melhorar performance nas consultas
            },
            {
                fields: ['personUid', 'isPrimary'], // Index composto para buscar endereço principal
                where: {
                    isPrimary: true,
                    isActive: true
                }
            }
        ]
    }
);