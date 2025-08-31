import {
	Person,
	CreatePersonData,
	UpdatePersonData,
	PersonResponsePublic,
	SearchPersonParams,
	PersonSearchResult
} from '../types/person.types';

export interface IPersonRepository {
	// Operações CRUD básicas
	create(personData: CreatePersonData): Promise<PersonResponsePublic>;
	
	update(uid: string, personData: UpdatePersonData): Promise<PersonResponsePublic>;
	
	delete(uid: string): Promise<boolean>;

	findByUid(uid: string): Promise<Person | null>;
	
	findByDocument(document: string): Promise<Person | null>;

	findByEmail(email: string): Promise<Person | null>;

	findByName(name: string): Promise<PersonResponsePublic[]>;

	searchPersons(params: SearchPersonParams): Promise<PersonSearchResult>;

	findActive(): Promise<PersonResponsePublic[]>;
	findInactive(): Promise<PersonResponsePublic[]>;
	findAll(): Promise<Person[]>;

	// Listar todos (sem dados sensíveis para resposta pública)
	findAllPublic(): Promise<PersonResponsePublic[]>;

}