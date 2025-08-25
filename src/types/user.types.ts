// Entidade User principal
export interface User {
	uid: string;
	name: string;
	email: string;
	password: string;
	isActive: boolean;
	personUid: string | null;
	createdAt: Date;
	updatedAt: Date;
}

// Para criação de usuário
export interface CreateUserData {
	name: string;
	email: string;
	password: string;
	personUid?: string | null;
}

// Para atualização (campos opcionais)
export interface UpdateUserData {
	name?: string;
	email?: string;
	password?: string;
	isActive?: boolean;
	personUid?: string | null;
}

// Para resposta (sem password)
export interface UserResponse {
	uid: string;
	name: string;
	email: string;
	isActive: boolean;
	personUid: string | null;
	createdAt: Date;
	updatedAt: Date;
}