import {
	Person,
	CreatePersonData,
	UpdatePersonData,
	PersonResponsePublic,
	SearchPersonParams,
	PersonWithAddresses,
	PersonSearchResult
} from '../types/person.types';
import {
	Address,
	CreateAddressData,
	UpdateAddressData,
	AddressResponse
} from "../types/address.types";
import { Person as PersonModel } from '../models/person';
import { Address as AddressModel } from '../models/address';
import { User as UserModel } from '../models/user';
import { IPersonRepository } from '../interfaces/IPersonRepository';
import { Op } from 'sequelize';

export class PersonRepository implements IPersonRepository {

	async create(personData: CreatePersonData): Promise<PersonResponsePublic> {
		try {
			const personModel = await PersonModel.create(personData as any);
			return this.mapToEntity(personModel);
		} catch (error: any) {
			throw new Error(`Failed to create person: ${error.message}`);
		}
	}

	async findByUid(uid: string): Promise<Person | null> {
		try {
			const personModel = await PersonModel.findByPk(uid);
			return personModel ? this.mapToEntity(personModel) : null;
		} catch (error: any) {
			throw new Error(`Failed to find person by UID: ${error.message}`);
		}
	}

	async findByName(name: string): Promise<PersonResponsePublic[]> {
		try {
			const personModels = await PersonModel.findAll({
				where: {
					[Op.or]: [
						{ name: { [Op.iLike]: `%${name}%` } }
					],
					isActive: true
				},
				order: [['name', 'ASC']]
			});
			return personModels.map(person => this.mapToPublicEntity(person));
		} catch (error: any) {
			throw new Error(`Failed to search persons: ${error.message}`);
		}
	}

	async findByDocument(document: string): Promise<Person | null> {
		try {
			const personModel = await PersonModel.findOne({
				where: { document }
			});
			return personModel ? this.mapToEntity(personModel) : null;
		} catch (error: any) {
			throw new Error(`Failed to find person by document: ${error.message}`);
		}
	}

	async findByEmail(email: string): Promise<Person | null> {
		try {
			const personModel = await PersonModel.findOne({
				where: { email }
			});
			return personModel ? this.mapToEntity(personModel) : null;
		} catch (error: any) {
			throw new Error(`Failed to find person by email: ${error.message}`);
		}
	}

	async update(uid: string, personData: UpdatePersonData): Promise<Person> {
		try {
			await PersonModel.update(personData, { where: { uid } });

			const updatedPerson = await this.findByUid(uid);
			if (!updatedPerson) {
				throw new Error('Person not found after update');
			}

			return updatedPerson;
		} catch (error: any) {
			throw new Error(`Failed to update person: ${error.message}`);
		}
	}

	async delete(uid: string): Promise<boolean> {
		try {
			const deletedCount = await PersonModel.destroy({ where: { uid } });
			return deletedCount > 0;
		} catch (error: any) {
			throw new Error(`Failed to delete person: ${error.message}`);
		}
	}

	async findAll(): Promise<Person[]> {
		try {
			const personModels = await PersonModel.findAll({
				order: [['name', 'ASC']]
			});
			return personModels.map(person => this.mapToEntity(person));
		} catch (error: any) {
			throw new Error(`Failed to find persons: ${error.message}`);
		}
	}

	/**
	 * Vincular uma pessoa com um usuário (1:1) - dados pessoais do usuário
	 */
	static async linkPersonToUser(personUid: string, userUid: string) {
		const person = await PersonModel.findByPk(personUid);
		const user = await UserModel.findByPk(userUid);

		if (!person) {
			throw new Error('Pessoa não encontrada');
		}

		if (!user) {
			throw new Error('Usuário não encontrado');
		}

		// Verifica se essa pessoa já está vinculada a outro usuário
		const existingUser = await UserModel.findOne({
			where: { personUid: personUid, uid: { [Op.ne]: userUid } }
		});
		if (existingUser) {
			throw new Error('Esta pessoa já está vinculada a outro usuário');
		}

		// Atualiza o usuário para apontar para a pessoa
		await user.update({ personUid: personUid });
		return user;
	}

	/**
	 * Buscar pessoa com relacionamentos: retorna a pessoa junto com o usuário vinculado
	 */
	static async getPersonWithRelations(uid: string) {
		const person = await PersonModel.findByPk(uid, {
			include: [
				{
					model: UserModel,
					as: 'user',
					attributes: ['uid', 'name', 'email']
				}
			]
		});

		if (!person) {
			throw new Error('Pessoa não encontrada');
		}

		return person;
	}


	//----

	/**
	* Listar pessoas com filtros e paginação
	*/
	// async searchPersons(
	//     filters: any = {},
	//     page: number = 1,
	//     limit: number = 10
	// ) {

	//     const offset = (page - 1) * limit;

	//     const whereClause: any = {};

	//     // Regra de negócio: Filtros inteligentes
	//     if (filters.name) {
	//         whereClause.name = { [Op.iLike]: `%${filters.name}%` };
	//     }

	//     if (filters.email) {
	//         whereClause.email = { [Op.iLike]: `%${filters.email}%` };
	//     }

	//     if (filters.cpf) {
	//         whereClause.cpf = formatCPF(filters.cpf);
	//     }

	//     if (filters.cnpj) {
	//         whereClause.cnpj = formatCNPJ(filters.cnpj);
	//     }

	//     const { count, rows } = await PersonModel.findAndCountAll({
	//         where: whereClause,
	//         limit,
	//         offset,
	//         order: [['createdAt', 'DESC']]
	//     });

	//     return {
	//         persons: rows,
	//         pagination: {
	//             page,
	//             limit,
	//             total: count,
	//             totalPages: Math.ceil(count / limit)
	//         }
	//     };
	// }
	async searchPersons(params: SearchPersonParams): Promise<PersonSearchResult> {
		const {
			name,
			document,
			email,
			orderBy = 'name',
			orderDirection = 'ASC',
			page = 1,
			limit = 10
		} = params;

		// Construir condições de busca
		const where: any = {};

		if (name) {
			where.name = {
				[Op.like]: `%${name}%`
			};
		}

		if (document) {
			where.document = {
				[Op.like]: `%${document}%`
			};
		}

		if (email) {
			where.email = {
				[Op.like]: `%${email}%`
			};
		}

		// Calcular offset para paginação
		const offset = (page - 1) * limit;

		// Definir ordenação
		const order: [string, string][] = [[orderBy, orderDirection]];

		try {
			// Executar busca com contagem total
			const { count, rows } = await PersonModel.findAndCountAll({
				where,
				order,
				limit,
				offset,
				attributes: {
					exclude: ['createdAt', 'updatedAt'] // remover campos desnecessários se necessário
				}
			});

			// Mapear os resultados para o tipo Person
			const data: PersonModel[] = rows.map((row: any) => ({
				uid: row.uid,
				name: row.name,
				//birthDate: row.birthDate,
				document: row.document,
				email: row.email,
				phone: row.phone,
				celPhone: row.celPhone,
				isActive: row.isActive,
				createdByUserUid: row.createdByUserUid,
				createdAt: row.createdAt,
				updatedByUserUid: row.updatedByUserUid,
				updatedAt: row.updatedAt
			}));

			// Calcular total de páginas
			const totalPages = Math.ceil(count / limit);

			return {
				data,
				total: count,
				page,
				limit,
				totalPages
			};
		} catch (error) {
			throw new Error(`Erro ao buscar pessoas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
		}
	}

	async findAllPublic(): Promise<PersonResponsePublic[]> {
		try {
			const personModels = await PersonModel.findAll({
				where: { isActive: true },
				order: [['name', 'ASC']]
			});
			return personModels.map(person => this.mapToPublicEntity(person));
		} catch (error: any) {
			throw new Error(`Failed to find persons: ${error.message}`);
		}
	}

	async findActive(): Promise<PersonResponsePublic[]> {
		try {
			const personModels = await PersonModel.findAll({
				where: { isActive: true },
				order: [['name', 'ASC']]
			});
			return personModels.map(person => this.mapToPublicEntity(person));
		} catch (error: any) {
			throw new Error(`Failed to find active persons: ${error.message}`);
		}
	}

	async findInactive(): Promise<PersonResponsePublic[]> {
		try {
			const personModels = await PersonModel.findAll({
				where: { isActive: false },
				order: [['name', 'ASC']]
			});
			return personModels.map(person => this.mapToPublicEntity(person));
		} catch (error: any) {
			throw new Error(`Failed to find inactive persons: ${error.message}`);
		}
	}

	// Mapeia modelo para entidade completa
	private mapToEntity(personModel: any): PersonResponse {
		return {
			uid: personModel.uid,
			name: personModel.name,
			//birthDate: personModel.birthDate,
			document: personModel.document,
			email: personModel.email,
			phone: personModel.phone,
			celPhone: personModel.celPhone,
			isActive: personModel.isActive,
			createdByUserUid: personModel.createdByUserUid,
			createdAt: personModel.createdAt,
			updatedByUserUid: personModel.updatedByUserUid,
			updatedAt: personModel.updatedAt
		};
	}

	// Mapeia para resposta pública - sem dados sensíveis
	private mapToPublicEntity(personModel: any): PersonResponsePublic {
		return {
			uid: personModel.uid,
			name: personModel.name,
			//birthDate: personModel.birthDate,
			//address: personModel.address,
			isActive: personModel.isActive,
			createdByUserUid: personModel.createdByUserUid,
			createdAt: personModel.createdAt,
			updatedAt: personModel.updatedAt
		};
	}



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

}