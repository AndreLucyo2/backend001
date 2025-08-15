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
    },
    {
        sequelize,
        tableName: 'persons',
    }
);