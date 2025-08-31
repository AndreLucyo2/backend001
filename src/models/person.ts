import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class Person extends Model {
	public uid!: string;
	public name!: string;
	public phone!: string;
	public email!: string;
	public document!: string; //CPF ou CNPJ 
	public observation!: string;
	public isActive!: boolean;
	public createdByUserUid!: string;
	public readonly createdAt!: Date;
	public updatedByUserUid!: string;
	public readonly updatedAt!: Date;
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
		document: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		observation: {
			type: DataTypes.TEXT,
			allowNull: true,
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
		tableName: 'persons',
	}
);