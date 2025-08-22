import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

interface PersonAttributes {
    uid: string;
    name: string;
    phone: string;
    email: string;
    cpf: string;
    cnpj: string;
    observation: string;
    active: boolean;
    createdByUserUid?: string | null;
    createdAt: Date;
    updatedByUserUid?: string | null;
    updatedAt: Date;
}

interface PersonCreationAttributes extends Optional<PersonAttributes, 'uid'> { }

export class Person extends Model<PersonAttributes, PersonCreationAttributes> implements PersonAttributes {
    public uid!: string;
    public name!: string;
    public phone!: string;
    public email!: string;
    public cpf!: string;
    public cnpj!: string;
    public observation!: string;
    public active!: boolean;
    public createdByUserUid!: string | null;
    public createdAt!: Date;
    public updatedByUserUid!: string | null;
    public updatedAt!: Date;
}

Person.init(
    {
        uid: {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4().toUpperCase(),
            primaryKey: true,
            set(value: string) {
                this.setDataValue('uid', value?.toUpperCase());
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        cpf: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        cnpj: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        observation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        active: {
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
        tableName: 'persons',
    }
);