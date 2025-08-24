import { Person, CreatePersonData, UpdatePersonData, PersonResponse } from '../types/person.types';

export interface IPersonRepository {
    // Operações CRUD básicas
    create(personData: Person): Promise<Person>;

    findByUid(uid: string): Promise<Person | null>;

    //Busca por CPF ou CNPJ
    findByDocument(document: string): Promise<Person | null>;

    findByEmail(email: string): Promise<Person | null>;

    update(uid: string, personData: UpdatePersonData): Promise<Person>;

    delete(uid: string): Promise<boolean>;

    // Operações de consulta
    findByName(name: string): Promise<PersonResponse[]>;
    findActive(): Promise<PersonResponse[]>;
    findInactive(): Promise<PersonResponse[]>;
    findAll(): Promise<Person[]>;

    // Listar todos (sem dados sensíveis para resposta pública)
    findAllPublic(): Promise<PersonResponse[]>;

}