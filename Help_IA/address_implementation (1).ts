// ==================================================
// 1. MODEL - Address Model (models/address.ts)
// ==================================================
import { DataTypes, Model } from 'sequelize';
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

// ==================================================
// 2. TYPES - Address Types (types/address.types.ts)
// ==================================================
export interface Address {
	uid: string;
	personUid: string;
	street: string;
	number: string | null;
	neighborhood: string | null;
	zipCode: string | null;
	city: string;
	state: string;
	country: string;
	observation: string | null;
	isPrimary: boolean;
	isActive: boolean;
	createdByUserUid: string;
	createdAt: Date;
	updatedByUserUid: string;
	updatedAt: Date;
}

export interface CreateAddressData {
	personUid: string;
	street: string;
	number?: string | null;
	neighborhood?: string | null;
	zipCode?: string | null;
	city: string;
	state: string;
	country?: string;
	observation?: string | null;
	isPrimary?: boolean;
	isActive?: boolean;
	createdByUserUid: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface UpdateAddressData {
	street?: string;
	number?: string | null;
	neighborhood?: string | null;
	zipCode?: string | null;
	city?: string;
	state?: string;
	country?: string;
	observation?: string | null;
	isPrimary?: boolean;
	isActive?: boolean;
	updatedByUserUid?: string;
	updatedAt?: Date;
}

export interface AddressResponse {
	uid: string;
	street: string;
	number: string | null;
	neighborhood: string | null;
	zipCode: string | null;
	city: string;
	state: string;
	country: string;
	observation: string | null;
	isPrimary: boolean;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Atualizar Person types para incluir endereços
export interface PersonWithAddresses {
	uid: string;
	name: string;
	birthDate: Date | null;
	document: string;
	email: string;
	phone: string | null;
	celPhone: string | null;
	isActive: boolean;
	createdByUserUid: string;
	createdAt: Date;
	updatedByUserUid: string;
	updatedAt: Date;
	addresses: AddressResponse[]; // Lista de endereços
	primaryAddress?: AddressResponse; // Endereço principal (opcional)
}

// ==================================================
// 3. INTERFACE - Address Repository (interfaces/IAddressRepository.ts)
// ==================================================
export interface IAddressRepository {
	// CRUD básico
	create(addressData: CreateAddressData): Promise<Address>;
	findByUid(uid: string): Promise<Address | null>;
	update(uid: string, addressData: UpdateAddressData): Promise<Address>;
	delete(uid: string): Promise<boolean>;
	
	// Operações específicas de endereço
	findByPersonUid(personUid: string): Promise<Address[]>;
	findPrimaryByPersonUid(personUid: string): Promise<Address | null>;
	setPrimaryAddress(personUid: string, addressUid: string): Promise<boolean>;
	deactivateAddress(uid: string, updatedByUserUid: string): Promise<boolean>;
	activateAddress(uid: string, updatedByUserUid: string): Promise<boolean>;
}

// ==================================================
// 4. REPOSITORY - Address Repository (repositories/address.repository.ts)
// ==================================================
import { Address as AddressModel } from '../models/address';
import { IAddressRepository } from '../interfaces/IAddressRepository';

export class AddressRepository implements IAddressRepository {
	
	async create(addressData: CreateAddressData): Promise<Address> {
		try {
			// Se for o primeiro endereço da pessoa, automaticamente vira principal
			const existingAddresses = await this.findByPersonUid(addressData.personUid);
			if (existingAddresses.length === 0) {
				addressData.isPrimary = true;
			}
			
			// Se está marcando como principal, desmarcar outros
			if (addressData.isPrimary) {
				await this.unsetOtherPrimaryAddresses(addressData.personUid);
			}
			
			const addressModel = await AddressModel.create(addressData as any);
			return this.mapToEntity(addressModel);
		} catch (error: any) {
			throw new Error(`Failed to create address: ${error.message}`);
		}
	}

	async findByUid(uid: string): Promise<Address | null> {
		try {
			const addressModel = await AddressModel.findByPk(uid);
			return addressModel ? this.mapToEntity(addressModel) : null;
		} catch (error: any) {
			throw new Error(`Failed to find address by UID: ${error.message}`);
		}
	}

	async update(uid: string, addressData: UpdateAddressData): Promise<Address> {
		try {
			// Se está marcando como principal, desmarcar outros da mesma pessoa
			if (addressData.isPrimary) {
				const address = await this.findByUid(uid);
				if (address) {
					await this.unsetOtherPrimaryAddresses(address.personUid, uid);
				}
			}
			
			await AddressModel.update(addressData, { where: { uid } });
			
			const updatedAddress = await this.findByUid(uid);
			if (!updatedAddress) {
				throw new Error('Address not found after update');
			}
			
			return updatedAddress;
		} catch (error: any) {
			throw new Error(`Failed to update address: ${error.message}`);
		}
	}

	async delete(uid: string): Promise<boolean> {
		try {
			const address = await this.findByUid(uid);
			if (!address) return false;
			
			const deletedCount = await AddressModel.destroy({ where: { uid } });
			
			// Se deletou o endereço principal, definir outro como principal
			if (address.isPrimary && deletedCount > 0) {
				await this.setFirstAddressAsPrimary(address.personUid);
			}
			
			return deletedCount > 0;
		} catch (error: any) {
			throw new Error(`Failed to delete address: ${error.message}`);
		}
	}

	async findByPersonUid(personUid: string): Promise<Address[]> {
		try {
			const addressModels = await AddressModel.findAll({
				where: { 
					personUid,
					isActive: true 
				},
				order: [['isPrimary', 'DESC'], ['createdAt', 'ASC']] // Principal primeiro
			});
			return addressModels.map(address => this.mapToEntity(address));
		} catch (error: any) {
			throw new Error(`Failed to find addresses by person UID: ${error.message}`);
		}
	}

	async findPrimaryByPersonUid(personUid: string): Promise<Address | null> {
		try {
			const addressModel = await AddressModel.findOne({
				where: { 
					personUid,
					isPrimary: true,
					isActive: true 
				}
			});
			return addressModel ? this.mapToEntity(addressModel) : null;
		} catch (error: any) {
			throw new Error(`Failed to find primary address: ${error.message}`);
		}
	}

	async setPrimaryAddress(personUid: string, addressUid: string): Promise<boolean> {
		try {
			// Verificar se o endereço pertence à pessoa
			const address = await this.findByUid(addressUid);
			if (!address || address.personUid !== personUid) {
				throw new Error('Address not found or does not belong to person');
			}
			
			// Desmarcar outros como principal
			await this.unsetOtherPrimaryAddresses(personUid, addressUid);
			
			// Marcar este como principal
			await AddressModel.update(
				{ isPrimary: true },
				{ where: { uid: addressUid } }
			);
			
			return true;
		} catch (error: any) {
			throw new Error(`Failed to set primary address: ${error.message}`);
		}
	}

	async deactivateAddress(uid: string, updatedByUserUid: string): Promise<boolean> {
		const updateData: UpdateAddressData = {
			isActive: false,
			updatedByUserUid,
			updatedAt: new Date()
		};
		
		const address = await this.findByUid(uid);
		if (!address) return false;
		
		await this.update(uid, updateData);
		
		// Se desativou o principal, definir outro como principal
		if (address.isPrimary) {
			await this.setFirstAddressAsPrimary(address.personUid);
		}
		
		return true;
	}

	async activateAddress(uid: string, updatedByUserUid: string): Promise<boolean> {
		const updateData: UpdateAddressData = {
			isActive: true,
			updatedByUserUid,
			updatedAt: new Date()
		};
		
		await this.update(uid, updateData);
		return true;
	}

	// Métodos auxiliares privados
	private async unsetOtherPrimaryAddresses(personUid: string, exceptUid?: string): Promise<void> {
		const whereClause: any = { 
			personUid,
			isPrimary: true 
		};
		
		if (exceptUid) {
			whereClause.uid = { [Op.ne]: exceptUid };
		}
		
		await AddressModel.update(
			{ isPrimary: false },
			{ where: whereClause }
		);
	}

	private async setFirstAddressAsPrimary(personUid: string): Promise<void> {
		const firstAddress = await AddressModel.findOne({
			where: { 
				personUid,
				isActive: true 
			},
			order: [['createdAt', 'ASC']]
		});
		
		if (firstAddress) {
			await AddressModel.update(
				{ isPrimary: true },
				{ where: { uid: firstAddress.uid } }
			);
		}
	}

	// Mapper
	private mapToEntity(addressModel: any): Address {
		return {
			uid: addressModel.uid,
			personUid: addressModel.personUid,
			street: addressModel.street,
			number: addressModel.number,
			neighborhood: addressModel.neighborhood,
			zipCode: addressModel.zipCode,
			city: addressModel.city,
			state: addressModel.state,
			country: addressModel.country,
			observation: addressModel.observation,
			isPrimary: addressModel.isPrimary,
			isActive: addressModel.isActive,
			createdByUserUid: addressModel.createdByUserUid,
			createdAt: addressModel.createdAt,
			updatedByUserUid: addressModel.updatedByUserUid,
			updatedAt: addressModel.updatedAt
		};
	}
}

// ==================================================
// 5. SERVICE - Address Service (services/address.service.ts)
// ==================================================
import { IAddressRepository } from '../interfaces/IAddressRepository';

export class AddressService {
	private addressRepository: IAddressRepository;

	constructor(addressRepository: IAddressRepository) {
		this.addressRepository = addressRepository;
	}

	async createAddress(addressData: CreateAddressData, createdByUserUid: string): Promise<AddressResponse> {
		// Validações básicas
		if (!addressData.street?.trim()) {
			throw new Error('Street is required');
		}
		if (!addressData.city?.trim()) {
			throw new Error('City is required');
		}
		if (!addressData.state?.trim()) {
			throw new Error('State is required');
		}

		// Preparar dados
		addressData.createdByUserUid = createdByUserUid;
		addressData.createdAt = new Date();
		addressData.updatedAt = new Date();

		const address = await this.addressRepository.create(addressData);
		return this.mapToResponse(address);
	}

	async getAddressByUid(uid: string): Promise<AddressResponse> {
		const address = await this.addressRepository.findByUid(uid);
		if (!address) {
			throw new Error('Address not found');
		}
		return this.mapToResponse(address);
	}

	async updateAddress(uid: string, updateData: UpdateAddressData, updatedByUserUid: string): Promise<AddressResponse> {
		const existingAddress = await this.addressRepository.findByUid(uid);
		if (!existingAddress) {
			throw new Error('Address not found');
		}

		updateData.updatedByUserUid = updatedByUserUid;
		updateData.updatedAt = new Date();

		const updatedAddress = await this.addressRepository.update(uid, updateData);
		return this.mapToResponse(updatedAddress);
	}

	async deleteAddress(uid: string): Promise<boolean> {
		return await this.addressRepository.delete(uid);
	}

	async getPersonAddresses(personUid: string): Promise<AddressResponse[]> {
		const addresses = await this.addressRepository.findByPersonUid(personUid);
		return addresses.map(address => this.mapToResponse(address));
	}

	async getPrimaryAddress(personUid: string): Promise<AddressResponse | null> {
		const address = await this.addressRepository.findPrimaryByPersonUid(personUid);
		return address ? this.mapToResponse(address) : null;
	}

	async setPrimaryAddress(personUid: string, addressUid: string): Promise<boolean> {
		return await this.addressRepository.setPrimaryAddress(personUid, addressUid);
	}

	async deactivateAddress(uid: string, updatedByUserUid: string): Promise<boolean> {
		return await this.addressRepository.deactivateAddress(uid, updatedByUserUid);
	}

	async activateAddress(uid: string, updatedByUserUid: string): Promise<boolean> {
		return await this.addressRepository.activateAddress(uid, updatedByUserUid);
	}

	// Mapper
	private mapToResponse(address: Address): AddressResponse {
		return {
			uid: address.uid,
			street: address.street,
			number: address.number,
			neighborhood: address.neighborhood,
			zipCode: address.zipCode,
			city: address.city,
			state: address.state,
			country: address.country,
			observation: address.observation,
			isPrimary: address.isPrimary,
			isActive: address.isActive,
			createdAt: address.createdAt,
			updatedAt: address.updatedAt
		};
	}
}

// ==================================================
// 6. CONTROLLER - Address Controller (controllers/address.controller.ts)
// ==================================================
import { Request, Response } from 'express';
import { AddressService } from '../services/address.service';
import { body, validationResult } from 'express-validator';

export class AddressController {
	private addressService: AddressService;

	constructor(addressService: AddressService) {
		this.addressService = addressService;
	}

	public static validations = {
		create: [
			body('personUid').notEmpty().isUUID(),
			body('street').notEmpty().trim(),
			body('city').notEmpty().trim(),
			body('state').notEmpty().trim(),
			body('country').optional().trim(),
			body('number').optional().trim(),
			body('neighborhood').optional().trim(),
			body('zipCode').optional().trim(),
			body('observation').optional().trim(),
		],
		update: [
			body('street').optional().trim(),
			body('city').optional().trim(),
			body('state').optional().trim(),
			body('country').optional().trim(),
			body('number').optional().trim(),
			body('neighborhood').optional().trim(),
			body('zipCode').optional().trim(),
			body('observation').optional().trim(),
			body('isPrimary').optional().isBoolean(),
		]
	};

	public create = async (req: Request, res: Response): Promise<Response> => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const address = await this.addressService.createAddress(req.body, req.user?.uid ?? "");
			return res.status(201).json({
				success: true,
				message: 'Address created successfully',
				data: address
			});
		} catch (error: any) {
			return res.status(400).json({ 
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public getByUid = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { uid } = req.params;
			const address = await this.addressService.getAddressByUid(uid);
			return res.json({
				success: true,
				message: 'Address found',
				data: address
			});
		} catch (error: any) {
			return res.status(404).json({ 
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public update = async (req: Request, res: Response): Promise<Response> => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { uid } = req.params;
			const address = await this.addressService.updateAddress(uid, req.body, req.user?.uid ?? "");
			return res.json({
				success: true,
				message: 'Address updated successfully',
				data: address
			});
		} catch (error: any) {
			return res.status(400).json({ 
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public delete = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { uid } = req.params;
			const deleted = await this.addressService.deleteAddress(uid);
			if (!deleted) {
				return res.status(404).json({ 
					success: false,
					message: 'Address not found',
					data: null
				});
			}
			return res.status(204).send();
		} catch (error: any) {
			return res.status(500).json({ 
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public getPersonAddresses = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { personUid } = req.params;
			const addresses = await this.addressService.getPersonAddresses(personUid);
			return res.json({
				success: true,
				message: 'Addresses found',
				data: addresses
			});
		} catch (error: any) {
			return res.status(500).json({ 
				success: false,
				message: error.message,
				data: null
			});
		}
	}

	public setPrimaryAddress = async (req: Request, res: Response): Promise<Response> => {
		try {
			const { personUid, addressUid } = req.params;
			const success = await this.addressService.setPrimaryAddress(personUid, addressUid);
			if (!success) {
				return res.status(400).json({ 
					success: false,
					message: 'Failed to set primary address',
					data: null
				});
			}
			return res.json({
				success: true,
				message: 'Primary address set successfully',
				data: null
			});
		} catch (error: any) {
			return res.status(400).json({ 
				success: false,
				message: error.message,
				data: null
			});
		}
	}
}

// ==================================================
// 7. ROUTES - Address Routes (routes/address.routes.ts)
// ==================================================
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { DIContainer } from '../container/DIContainer';

export const addressRoutes = Router();
const addressController = DIContainer.createAddressController();

// CRUD básico de endereços
addressRoutes.post('/create', authMiddleware, addressController.create);
addressRoutes.get('/:uid', authMiddleware, addressController.getByUid);
addressRoutes.put('/:uid', authMiddleware, addressController.update);
addressRoutes.delete('/:uid', authMiddleware, addressController.delete);

// Operações específicas
addressRoutes.get('/person/:personUid', authMiddleware, addressController.getPersonAddresses);
addressRoutes.put('/person/:personUid/primary/:addressUid', authMiddleware, addressController.setPrimaryAddress);

// ==================================================
// 8. ATUALIZAR DIContainer (container/DIContainer.ts)
// ==================================================
// Adicionar ao DIContainer existente:

import { AddressRepository } from '../repositories/address.repository';
import { AddressService } from '../services/address.service';
import { AddressController } from '../controllers/address.controller';
import { IAddressRepository } from '../interfaces/IAddressRepository';

// Adicionar à classe DIContainer:
private static addressRepositoryInstance: IAddressRepository;

static getAddressRepository(): IAddressRepository {
    if (!this.addressRepositoryInstance) {
        this.addressRepositoryInstance = new AddressRepository();
    }
    return this.addressRepositoryInstance;
}

static createAddressService(): AddressService {
    const addressRepository = this.getAddressRepository();
    return new AddressService(addressRepository);
}

static createAddressController(): AddressController {
    const addressService = this.createAddressService();
    return new AddressController(addressService);
}

// ==================================================
// 9. RELACIONAMENTO NO MODEL PERSON (atualizar person.ts)
// ==================================================
// Adicionar ao final do arquivo person.ts:

import { Address } from './address';

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

// ==================================================
// 10. ATUALIZAR PERSON REPOSITORY (person.repository.ts)
// ==================================================
// Adicionar método para buscar pessoa com endereços:

async findByUidWithAddresses(uid: string): Promise<PersonWithAddresses | null> {
    try {
        const personModel = await PersonModel.findByPk(uid, {
            include: [
                {
                    model: AddressModel,
                    as: 'addresses',
                    where: { isActive: true },
                    required: false,
                    order: [['isPrimary', 'DESC'], ['createdAt', 'ASC']]
                }
            ]
        });
        
        if (!personModel) return null;
        
        const person = this.mapToEntity(personModel);
        const addresses = personModel.addresses?.map((addr: any) => this.mapAddressToResponse(addr)) || [];
        const primaryAddress = addresses.find(addr => addr.isPrimary);
        
        return {
            ...person,
            addresses,
            primaryAddress
        };
    } catch (error: any) {
        throw new Error(`Failed to find person with addresses: ${error.message}`);
    }
}

private mapAddressToResponse(addressModel: any): AddressResponse {
    return {
        uid: addressModel.uid,
        street: addressModel.street,
        number: addressModel.number,
        neighborhood: addressModel.neighborhood,
        zipCode: addressModel.zipCode,
        city: addressModel.city,
        state: addressModel.state,
        country: addressModel.country,
        observation: addressModel.observation,
        isPrimary: addressModel.isPrimary,
        isActive: addressModel.isActive,
        createdAt: addressModel.createdAt,
        updatedAt: addressModel.updatedAt
    };
}

// ==================================================
// 11. MIGRATION PARA CRIAR TABELA ADDRESSES
// ==================================================
// migrations/003_create_addresses_table.ts

export const createAddressesTable = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable('addresses', {
            uid: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false
            },
            personUid: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'persons', key: 'uid' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            street: {
                type: DataTypes.STRING,
                allowNull: false
            },
            number: {
                type: DataTypes.STRING,
                allowNull: true
            },
            neighborhood: {
                type: DataTypes.STRING,
                allowNull: true
            },
            zipCode: {
                type: DataTypes.STRING,
                allowNull: true
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Brasil'
            },
            observation: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            isPrimary: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            createdByUserUid: {
                type: DataTypes.UUID,
                allowNull: true,
                references: { model: 'users', key: 'uid' }
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedByUserUid: {
                type: DataTypes.UUID,
                allowNull: true,
                references: { model: 'users', key: 'uid' }
            }
        });

        // Criar indexes
        await queryInterface.addIndex('addresses', ['personUid']);
        await queryInterface.addIndex('addresses', ['personUid', 'isPrimary'], {
            where: { isPrimary: true, isActive: true }
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable('addresses');
    }
};

// ==================================================
// 12. EXEMPLO DE USO DA API
// ==================================================

/*
// 1. Criar endereço
POST /api/addresses/create
{
  "personUid": "PERSON-123-UUID",
  "street": "Rua das Flores",
  "number": "123",
  "neighborhood": "Centro",
  "zipCode": "12345-678",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "observation": "Próximo ao mercado"
}

// 2. Listar endereços de uma pessoa
GET /api/addresses/person/PERSON-123-UUID

// 3. Atualizar endereço
PUT /api/addresses/ADDRESS-456-UUID
{
  "street": "Rua Nova",
  "number": "456",
  "isPrimary": true
}

// 4. Definir endereço principal
PUT /api/addresses/person/PERSON-123-UUID/primary/ADDRESS-456-UUID

// 5. Buscar pessoa com endereços
GET /api/persons/PERSON-123-UUID/with-addresses

// Resposta esperada:
{
  "success": true,
  "message": "Person found with addresses",
  "data": {
    "uid": "PERSON-123-UUID",
    "name": "João Silva",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "document": "123.456.789-01",
    "email": "joao@email.com",
    "phone": "(11) 99988-7766",
    "celPhone": "(11) 91234-5678",
    "isActive": true,
    "addresses": [
      {
        "uid": "ADDRESS-456-UUID",
        "street": "Rua das Flores",
        "number": "123",
        "neighborhood": "Centro",
        "zipCode": "12345-678",
        "city": "São Paulo",
        "state": "SP",
        "country": "Brasil",
        "observation": "Próximo ao mercado",
        "isPrimary": true,
        "isActive": true,
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-01T10:00:00.000Z"
      },
      {
        "uid": "ADDRESS-789-UUID",
        "street": "Avenida Paulista",
        "number": "1000",
        "neighborhood": "Bela Vista",
        "zipCode": "01310-100",
        "city": "São Paulo",
        "state": "SP",
        "country": "Brasil",
        "observation": "Endereço comercial",
        "isPrimary": false,
        "isActive": true,
        "createdAt": "2025-01-02T15:00:00.000Z",
        "updatedAt": "2025-01-02T15:00:00.000Z"
      }
    ],
    "primaryAddress": {
      "uid": "ADDRESS-456-UUID",
      "street": "Rua das Flores",
      "number": "123",
      "neighborhood": "Centro",
      "zipCode": "12345-678",
      "city": "São Paulo",
      "state": "SP",
      "country": "Brasil",
      "observation": "Próximo ao mercado",
      "isPrimary": true,
      "isActive": true,
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    }
  }
}
*/

// ==================================================
// 13. ATUALIZAR PERSON SERVICE (services/person.service.ts)
// ==================================================
// Adicionar método para buscar pessoa com endereços:

async getPersonWithAddresses(uid: string): Promise<PersonWithAddresses> {
    const personWithAddresses = await this.personRepository.findByUidWithAddresses(uid);
    if (!personWithAddresses) {
        throw new Error('Person not found');
    }
    return personWithAddresses;
}

// ==================================================
// 14. ATUALIZAR PERSON CONTROLLER (controllers/person.controller.ts)
// ==================================================
// Adicionar método para buscar pessoa com endereços:

public getByUidWithAddresses = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { uid } = req.params;
        const personWithAddresses = await this.personService.getPersonWithAddresses(uid);
        return res.json({
            success: true,
            message: 'Person found with addresses',
            data: personWithAddresses
        });
    } catch (error: any) {
        return res.status(404).json({ 
            success: false,
            message: error.message,
            data: null
        });
    }
}

// ==================================================
// 15. ATUALIZAR PERSON ROUTES (routes/person.routes.ts)
// ==================================================
// Adicionar nova rota:

personRoutes.get(
    '/:uid/with-addresses',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await personController.getByUidWithAddresses(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// ==================================================
// 16. ATUALIZAR ROUTES PRINCIPAIS (routes/index.ts)
// ==================================================
// Adicionar importação e registro das rotas de endereço:

import { addressRoutes } from './address.routes';

// No método setupRoutes:
app.use('/api/addresses', addressRoutes);

// ==================================================
// 17. PLANO DE IMPLEMENTAÇÃO EM ORDEM
// ==================================================

/*
FASE 1: Estrutura Base (1-2 horas)
✅ 1. Criar arquivo types/address.types.ts
✅ 2. Criar arquivo models/address.ts
✅ 3. Executar migration para criar tabela addresses
✅ 4. Testar se tabela foi criada corretamente

FASE 2: Repository e Service (2-3 horas)  
✅ 5. Criar interfaces/IAddressRepository.ts
✅ 6. Criar repositories/address.repository.ts
✅ 7. Criar services/address.service.ts
✅ 8. Testar CRUD básico de endereços

FASE 3: Controller e Routes (1-2 horas)
✅ 9. Criar controllers/address.controller.ts
✅ 10. Criar routes/address.routes.ts
✅ 11. Atualizar DIContainer
✅ 12. Testar endpoints básicos

FASE 4: Relacionamento Person-Address (2-3 horas)
✅ 13. Atualizar model Person com relacionamento
✅ 14. Atualizar PersonRepository com método findByUidWithAddresses
✅ 15. Atualizar PersonService e PersonController
✅ 16. Testar busca de pessoa com endereços

FASE 5: Lógica de Negócio e Testes (1-2 horas)
✅ 17. Implementar lógica de endereço principal
✅ 18. Testar cenários:
    - Primeiro endereço vira principal automaticamente
    - Ao definir novo principal, antigo é desmarcado
    - Ao deletar principal, outro vira principal
    - Validações de negócio funcionando

Total estimado: 7-12 horas
*/

// ==================================================
// 18. COMANDOS PARA TESTAR A IMPLEMENTAÇÃO
// ==================================================

/*
// 1. Criar migração e executar
npm run migration:create -- create_addresses_table
npm run migration:run

// 2. Testar criação de endereço
POST http://localhost:3000/api/addresses/create
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "personUid": "EXISTING-PERSON-UUID",
  "street": "Rua Teste",
  "number": "123",
  "city": "São Paulo", 
  "state": "SP",
  "neighborhood": "Centro",
  "zipCode": "01234-567"
}

// 3. Testar busca pessoa com endereços
GET http://localhost:3000/api/persons/EXISTING-PERSON-UUID/with-addresses
Authorization: Bearer {seu_token}

// 4. Criar segundo endereço para mesma pessoa
POST http://localhost:3000/api/addresses/create
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "personUid": "EXISTING-PERSON-UUID",
  "street": "Avenida Teste",
  "number": "456",
  "city": "São Paulo",
  "state": "SP"
}

// 5. Definir segundo endereço como principal
PUT http://localhost:3000/api/addresses/person/EXISTING-PERSON-UUID/primary/NEW-ADDRESS-UUID
Authorization: Bearer {seu_token}

// 6. Verificar se mudou principal
GET http://localhost:3000/api/persons/EXISTING-PERSON-UUID/with-addresses
Authorization: Bearer {seu_token}
*/

// ==================================================
// 19. REGRAS DE NEGÓCIO IMPLEMENTADAS
// ==================================================

/*
✅ REGRA 1: Uma pessoa pode ter vários endereços
   - Relacionamento 1:N implementado via FK personUid

✅ REGRA 2: Apenas um endereço principal por pessoa
   - Campo isPrimary com constraint lógica no service
   - Ao definir novo principal, outros são desmarcados

✅ REGRA 3: Se tiver apenas um endereço, este é principal
   - Lógica implementada no create do repository
   - Primeiro endereço automaticamente vira principal

✅ REGRA 4: Endereços não são compartilhados
   - Cada endereço pertence a apenas uma pessoa
   - FK personUid obrigatório e único por endereço

✅ REGRA 5: Campos obrigatórios validados
   - street, city, state são obrigatórios
   - Validação no service e controller

✅ REGRA 6: Chave UID como relacionamento
   - Usando UUID em todas as tabelas
   - Relacionamento via personUid (UUID)

✅ REGRA 7: Nomes em inglês mantidos
   - Todos campos em inglês conforme solicitado
   - Estrutura de pastas mantida

✅ REGRA 8: Soft delete implementado
   - Campo isActive para desativar sem deletar
   - Endereços inativos não aparecem nas consultas
*/

// ==================================================
// 20. POSSÍVEIS MELHORIAS FUTURAS
// ==================================================

/*
🔄 FASE FUTURA: Melhorias opcionais
- Validação de CEP via API externa
- Geocodificação de endereços (lat/lng)
- Histórico de endereços (auditoria)
- Tipos de endereço (residencial, comercial)
- Integração com serviços de entrega
- Cache de endereços frequentes
- Validação de endereços duplicados similar
*/