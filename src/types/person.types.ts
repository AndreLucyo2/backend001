// Entidade Person principal
export interface Person {
    uid: string;
    firstName: string;
    lastName: string;
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
    firstName: string;
    lastName?: string | null;
    birthDate?: Date | null;
    document?: string | null; //CPF ou CNPJ 
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    isActive: boolean | true;
    createdByUserUid: string; //Quem criou o cadastro
    createdAt: Date | null; //Data de criação (padrão é agora)
    updatedAt: Date | null; //Data de edicao (padrão é agora)
}

// Para atualização (campos opcionais)
export interface UpdatePersonData {
    firstName?: string;
    lastName?: string;
    birthDate?: Date | null;
    document?: string; //CPF ou CNPJ 
    phone?: string | null;
    address?: string | null;
    isActive?: boolean | true;
    updatedByUserUid: string | null; //Quem editou por ultimo
    updatedAt: Date | null; //Data de edicao (padrão é agora)
}

// Para resposta pública
export interface PersonResponse {
    uid: string;
    firstName: string;
    lastName: string;
    fullName: string; // computed field
    birthDate: Date | null;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}