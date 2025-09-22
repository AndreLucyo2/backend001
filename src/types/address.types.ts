
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
	updatedByUserUid: string;
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

