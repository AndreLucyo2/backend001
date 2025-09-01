// models/person.ts - Versão completa com relacionamento Address
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Definir interface para os atributos do modelo
interface PersonAttributes {
	uid: string;
	name: string;
	birthDate?: Date | null;
	phone?: string | null;
	celPhone?: string | null;
	email?: string | null;
	document?: string | null; // CPF ou CNPJ 
	address?: string | null; // Endereço em texto livre (campo legado)
	observation?: string | null;
	isActive: boolean;
	createdByUserUid?: string | null;
	createdAt: Date;
	updatedByUserUid?: string | null;
	updatedAt: Date;
}

// Definir quais campos são opcionais na criação
interface PersonCreationAttributes extends Optional<PersonAttributes, 'uid' | 'createdAt' | 'updatedAt' | 'birthDate' | 'phone' | 'celPhone' | 'email' | 'document' | 'address' | 'observation' | 'createdByUserUid' | 'updatedByUserUid'> {}

export class Person extends Model<PersonAttributes, PersonCreationAttributes> implements PersonAttributes {
	public uid!: string;
	public name!: string;
	public birthDate!: Date | null;
	public phone!: string | null;
	public celPhone!: string | null;
	public email!: string | null;
	public document!: string | null; // CPF ou CNPJ 
	public address!: string | null; // Campo legado para compatibilidade
	public observation!: string | null;
	public isActive!: boolean;
	public createdByUserUid!: string | null;
	public readonly createdAt!: Date;
	public updatedByUserUid!: string | null;
	public readonly updatedAt!: Date;

	// Timestamps automáticos
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

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
		birthDate: {
			type: DataTypes.DATE,
			allowNull: true,
			validate: {
				isDate: {
					msg: 'Birth date must be a valid date'
				},
				isBefore: {
					args: new Date().toISOString(),
					msg: 'Birth date cannot be in the future'
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
				where: {
					document: {
						[DataTypes.Op.ne]: null
					}
				},
				name: 'idx_persons_document_unique'
			},
			{
				fields: ['email'],
				where: {
					email: {
						[DataTypes.Op.ne]: null
					}
				},
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

// ==================================================
// DEFINIR RELACIONAMENTOS APÓS IMPORTAÇÕES
// ==================================================

// Esta função deve ser chamada após todos os models serem carregados
// Geralmente em um arquivo de associações ou no setup do banco
export const setupPersonAssociations = () => {
	// Import aqui para evitar circular dependency
	const { Address } = require('./address');

	// Person possui muitos Addresses
	Person.hasMany(Address, {
		foreignKey: 'personUid',
		sourceKey: 'uid',
		as: 'addresses',
		onDelete: 'CASCADE', // Se person for deletada, deletar endereços
		onUpdate: 'CASCADE'
	});

	// Relacionamento específico para endereço principal
	Person.hasOne(Address, {
		foreignKey: 'personUid',
		sourceKey: 'uid',
		as: 'primaryAddress',
		scope: {
			isPrimary: true,
			isActive: true
		},
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE'
	});

	// Relacionamento com User (quem criou)
	const { User } = require('./user');
	
	Person.belongsTo(User, {
		foreignKey: 'createdByUserUid',
		targetKey: 'uid',
		as: 'createdByUser',
		constraints: false // Para evitar problemas com dados legados
	});

	Person.belongsTo(User, {
		foreignKey: 'updatedByUserUid',
		targetKey: 'uid',
		as: 'updatedByUser',
		constraints: false
	});
};

// ==================================================
// MÉTODOS DE INSTÂNCIA PERSONALIZADOS
// ==================================================

// Adicionar métodos úteis à instância do modelo
Person.prototype.toJSON = function() {
	const values = { ...this.get() };
	
	// Remover campos sensíveis se necessário
	// delete values.document; // Descomente se quiser ocultar documento
	
	return values;
};

// Método para verificar se pessoa é ativa
Person.prototype.isPersonActive = function(): boolean {
	return this.isActive === true;
};

// Método para obter nome completo formatado
Person.prototype.getFormattedName = function(): string {
	return this.name ? this.name.trim() : '';
};

// Método para verificar se tem endereço principal
Person.prototype.hasPrimaryAddress = function(): boolean {
	return this.addresses && this.addresses.some((addr: any) => addr.isPrimary === true);
};

// ==================================================
// MÉTODOS DE CLASSE (STATIC)
// ==================================================

// Buscar pessoa por documento
Person.findByDocument = async function(document: string) {
	return await Person.findOne({
		where: { 
			document: document.replace(/\D/g, ''),
			isActive: true 
		}
	});
};

// Buscar pessoa por email
Person.findByEmail = async function(email: string) {
	return await Person.findOne({
		where: { 
			email: email.trim().toLowerCase(),
			isActive: true 
		}
	});
};

// Buscar pessoas ativas com endereços
Person.findActiveWithAddresses = async function(options: any = {}) {
	const { Address } = require('./address');
	
	return await Person.findAll({
		where: { 
			isActive: true,
			...options.where
		},
		include: [
			{
				model: Address,
				as: 'addresses',
				where: { isActive: true },
				required: false, // LEFT JOIN - incluir mesmo sem endereços
				order: [['isPrimary', 'DESC'], ['createdAt', 'ASC']]
			},
			{
				model: Address,
				as: 'primaryAddress',
				required: false
			}
		],
		order: [['name', 'ASC']],
		...options
	});
};

// Estatísticas de pessoas
Person.getStats = async function() {
	const total = await Person.count();
	const active = await Person.count({ where: { isActive: true } });
	const withAddresses = await Person.count({
		include: [{
			model: require('./address').Address,
			as: 'addresses',
			where: { isActive: true },
			required: true
		}]
	});

	return {
		total,
		active,
		inactive: total - active,
		withAddresses,
		withoutAddresses: active - withAddresses
	};
};

export default Person;