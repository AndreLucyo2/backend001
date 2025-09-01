import {
    Address,
    CreateAddressData,
    UpdateAddressData,
    AddressResponse
} from "../types/address.types";
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