import {
    Address,
    CreateAddressData,
    UpdateAddressData
} from "../types/address.types";
import { Address as AddressModel } from '../models/address';
import { IAddressRepository } from '../interfaces/IAddressRepository';
import { Op } from 'sequelize';

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
