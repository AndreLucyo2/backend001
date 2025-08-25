import {
	Person,
	CreatePersonData,
	UpdatePersonData,
	PersonResponse,
	SearchPersonParams,
	PersonSearchResult
} from '../types/person.types';

export interface IPersonRepository {
	// Operações CRUD básicas
	create(personData: CreatePersonData): Promise<PersonResponse>;

	findByUid(uid: string): Promise<Person | null>;

	update(uid: string, personData: UpdatePersonData): Promise<PersonResponse>;

	delete(uid: string): Promise<boolean>;

	//Busca por CPF ou CNPJ
	findByDocument(document: string): Promise<Person | null>;

	findByEmail(email: string): Promise<Person | null>;

	findByName(name: string): Promise<PersonResponse[]>;

	// Operações de consulta
	searchPersons(params: SearchPersonParams): Promise<PersonSearchResult>;

	findActive(): Promise<PersonResponse[]>;
	findInactive(): Promise<PersonResponse[]>;
	findAll(): Promise<Person[]>;

	// Listar todos (sem dados sensíveis para resposta pública)
	findAllPublic(): Promise<PersonResponse[]>;

}