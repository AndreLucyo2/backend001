import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Address } from './address';

export class Person extends Model {
	public uid!: string;
	public name!: string;
	public phone!: string;
	public celPhone!: string;
	public email!: string;
	public document!: string; //CPF ou CNPJ 
	public observation!: string;
	public birthDate?: Date | null;
	public isActive!: boolean;
	public createdByUserUid!: string;
	public readonly createdAt!: Date;
	public updatedByUserUid!: string;
	public updatedAt!: Date;

	// Associações - definidas após inicialização
	public addresses?: any[]; // Será tipado corretamente após import do Address model

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
			validate: {
				notEmpty: {
					msg: 'Name cannot be empty'
				},
				len: {
					args: [2, 255],
					msg: 'Name must be between 2 and 255 characters'
				}
			}
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: {
					args: [0, 20],
					msg: 'Phone must be less than 20 characters'
				}
			}
		},
		celPhone: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: {
					args: [0, 20],
					msg: 'Cell phone must be less than 20 characters'
				}
			}
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isEmail: {
					msg: 'Must be a valid email address'
				}
			}
		},
		document: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: {
				name: 'unique_document',
				msg: 'Document already exists'
			},
			validate: {
				len: {
					args: [0, 20],
					msg: 'Document must be less than 20 characters'
				}
			}
		},
		address: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Legacy field - use addresses table for structured addresses'
		},
		observation: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		birthDate: {
			type: DataTypes.DATE,
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
			references: {
				model: 'users',
				key: 'uid'
			},
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL'
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
			references: {
				model: 'users',
				key: 'uid'
			},
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL'
		},
	},
	{
		sequelize,
		tableName: 'persons',
		timestamps: true, // Habilita createdAt e updatedAt automáticos
		paranoid: false, // Se true, habilita soft delete com deletedAt
		indexes: [
			{
				fields: ['name'],
				name: 'idx_persons_name'
			},
			{
				fields: ['document'],
				unique: true,
				name: 'idx_persons_document_unique'
			},
			{
				fields: ['email'],
				name: 'idx_persons_email'
			},
			{
				fields: ['isActive'],
				name: 'idx_persons_active'
			},
			{
				fields: ['createdByUserUid'],
				name: 'idx_persons_created_by'
			}
		],
		hooks: {
			beforeValidate: (person: Person) => {
				// Normalizar strings antes da validação
				if (person.name) {
					person.name = person.name.trim();
				}
				if (person.email) {
					person.email = person.email.trim().toLowerCase();
				}
				if (person.document) {
					person.document = person.document.replace(/\D/g, ''); // Remove caracteres não numéricos
				}
			},
			beforeUpdate: (person: Person) => {
				// Atualizar timestamp de update
				person.updatedAt = new Date();
			}
		}
	}
);

// Person.init(
// 	{
// 		uid: {
// 			type: DataTypes.UUID,
// 			defaultValue: () => uuidv4().toUpperCase(),
// 			primaryKey: true,
// 			set(value: string) {
// 				this.setDataValue('uid', value?.toUpperCase());
// 			}
// 		},
// 		name: {
// 			type: DataTypes.STRING,
// 			allowNull: false,
// 		},
// 		phone: {
// 			type: DataTypes.STRING,
// 			allowNull: true,
// 		},
// 		celPhone: {
// 			type: DataTypes.STRING,
// 			allowNull: true,
// 		},
// 		email: {
// 			type: DataTypes.STRING,
// 			allowNull: true,
// 		},
// 		document: {
// 			type: DataTypes.STRING,
// 			allowNull: true,
// 		},
// 		observation: {
// 			type: DataTypes.TEXT,
// 			allowNull: true,
// 		},
// 		isActive: {
// 			type: DataTypes.BOOLEAN,
// 			allowNull: false,
// 			defaultValue: true,
// 		},
// 		createdByUserUid: {
// 			type: DataTypes.UUID,
// 			allowNull: true,
// 			references: { model: 'users', key: 'uid' }
// 		},
// 		createdAt: {
// 			type: DataTypes.DATE,
// 			allowNull: false,
// 			defaultValue: DataTypes.NOW,
// 		},
// 		updatedAt: {
// 			type: DataTypes.DATE,
// 			allowNull: false,
// 			defaultValue: DataTypes.NOW,
// 		},
// 		updatedByUserUid: {
// 			type: DataTypes.UUID,
// 			allowNull: true,
// 			references: { model: 'users', key: 'uid' }
// 		},
// 	},
// 	{
// 		sequelize,
// 		tableName: 'persons',
// 	}
// );

// Definir relacionamentos
Person.hasMany(Address, {
	foreignKey: 'personUid',
	sourceKey: 'uid',
	as: 'addresses'
});

Address.belongsTo(Person, {
	foreignKey: 'personUid',
	targetKey: 'uid',
	as: 'person'
});