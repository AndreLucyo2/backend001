import {
	Address,
	CreateAddressData,
	UpdateAddressData,
	AddressResponse
} from "../types/address.types";

// Entidade Person principal
export interface Person {
	uid: string;
	name: string;
	birthDate: Date | null;
	document?: string | null;
	email?: string | null;
	phone?: string | null;
	celPhone?: string | null;
	addresses?: AddressResponse[]  | null;
	isActive: boolean;
	createdByUserUid: string;
	createdAt: Date;
	updatedByUserUid: string;
	updatedAt: Date;
}

// Para criação de pessoa
export interface CreatePersonData {
	name: string;
	birthDate?: Date | null;
	document?: string | null; //CPF ou CNPJ 
	email?: string | null;
	phone?: string | null;
	celPhone?: string | null;
	addresses?: AddressResponse[]  | null;
	isActive: boolean | true;
	createdByUserUid: string; //Quem criou o cadastro
	createdAt: Date; //Data de criação (padrão é agora)
	updatedAt: Date; //Data de edicao (padrão é agora)
}

// Para atualização (campos opcionais)
export interface UpdatePersonData {
	name?: string;
	birthDate?: Date | null;
	document?: string | null; //CPF ou CNPJ 
	phone?: string | null;
	celPhone?: string | null;
	addresses?: AddressResponse[]  | null;
	isActive?: boolean | true;
	updatedByUserUid: string; //Quem editou por ultimo
	updatedAt: Date; //Data de edicao (padrão é agora)
}

export interface PersonResponse {
	uid: string;
	name: string;
	birthDate: Date | null;
	document?: string | null; //CPF ou CNPJ 
	email?: string | null;
	phone?: string | null;
	celPhone?: string | null;
	addresses?: AddressResponse[] | null;
	primaryAddress?: string | null;
	observation?: string | null;
	isActive: boolean;
	createdByUserUid: string; //Quem criou o cadastro
	updatedByUserUid: string; //Quem criou o cadastro
	createdAt: Date;
	updatedAt: Date;
}

// Para resposta pública
export interface PersonResponsePublic {
	uid: string;
	name: string;
	birthDate?: Date | null;
	addresses?: AddressResponse[] | null;
	isActive: boolean;
	createdByUserUid: string; //Quem criou o cadastro
	createdAt: Date;
	updatedAt: Date;
}

// Tipo específico para busca (campos que você quer pesquisar)
export interface SearchPersonParams {
	name?: string;
	document?: string | null;
	email?: string | null;
	phone?: string | null;
	celPhone?: string | null;
	orderBy?: 'name' | 'document' | 'email';
	orderDirection?: 'ASC' | 'DESC';
	page?: number;
	limit?: number;
}

export interface SearchResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
export interface PersonSearchResult extends SearchResult<Person> { }

// Tipo para resposta da API
export interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data: T | null;
	pagination?: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}


// Atualizar Person types para incluir endereços
export interface PersonWithAddresses {
	uid: string;
	name: string;
	birthDate: Date | null;
	document?: string | null;
	email?: string | null;
	phone?: string | null;
	celPhone?: string | null;
	isActive: boolean;
	createdByUserUid: string;
	createdAt: Date;
	updatedByUserUid: string;
	updatedAt: Date;
	addresses?: AddressResponse[] | null;
	primaryAddress?: string | null; // uid do Endereço principal (opcional)
}