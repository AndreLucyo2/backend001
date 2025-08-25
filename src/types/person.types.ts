// Entidade Person principal
export interface Person {
	uid: string;
	name: string;
	birthDate: Date | null;
	document: string;
	email: string;
	phone: string | null;
	address: string | null;
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
	address?: string | null;
	isActive: boolean | true;
	createdByUserUid: string; //Quem criou o cadastro
	createdAt: Date; //Data de criação (padrão é agora)
	updatedAt: Date; //Data de edicao (padrão é agora)
}

// Para atualização (campos opcionais)
export interface UpdatePersonData {
	name?: string;
	birthDate?: Date | null;
	document?: string; //CPF ou CNPJ 
	phone?: string | null;
	address?: string | null;
	isActive?: boolean | true;
	updatedByUserUid: string | null; //Quem editou por ultimo
	updatedAt: Date; //Data de edicao (padrão é agora)
}

// Para resposta pública
export interface PersonResponse {
	uid: string;
	name: string;
	birthDate: Date | null;
	address: string | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Tipo específico para busca (campos que você quer pesquisar)
export interface SearchPersonParams {
	name?: string;
	document?: string;
	email?: string;
	phone?: string;
	orderBy?: 'name' | 'document' | 'email' | 'phone';
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