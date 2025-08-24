import { IPersonRepository } from '../interfaces/IPersonRepository';
import { Person, CreatePersonData, UpdatePersonData, PersonResponse } from '../types/person.types';
import { Person as PersonModel } from '../models/person';
import { Op } from 'sequelize';

export class PersonRepository implements IPersonRepository {

    async create(personData: CreatePersonData): Promise<Person> {
        try {
            const personModel = await PersonModel.create(personData as any);
            return this.mapToEntity(personModel);
        } catch (error: any) {
            throw new Error(`Failed to create person: ${error.message}`);
        }
    }

    async findByUid(uid: string): Promise<Person | null> {
        try {
            const personModel = await PersonModel.findByPk(uid);
            return personModel ? this.mapToEntity(personModel) : null;
        } catch (error: any) {
            throw new Error(`Failed to find person by UID: ${error.message}`);
        }
    }

    async findByName(name: string): Promise<PersonResponse[]> {
        try {
            const personModels = await PersonModel.findAll({
                where: {
                    [Op.or]: [
                        { firstName: { [Op.iLike]: `%${name}%` } },
                        { lastName: { [Op.iLike]: `%${name}%` } }
                    ],
                    isActive: true
                },
                order: [['firstName', 'ASC']]
            });
            return personModels.map(person => this.mapToPublicEntity(person));
        } catch (error: any) {
            throw new Error(`Failed to search persons: ${error.message}`);
        }
    }

    async findByDocument(document: string): Promise<Person | null> {
        try {
            const personModel = await PersonModel.findOne({
                where: { document }
            });
            return personModel ? this.mapToEntity(personModel) : null;
        } catch (error: any) {
            throw new Error(`Failed to find person by document: ${error.message}`);
        }
    }

    async findByEmail(email: string): Promise<Person | null> {
        try {
            const personModel = await PersonModel.findOne({
                where: { email }
            });
            return personModel ? this.mapToEntity(personModel) : null;
        } catch (error: any) {
            throw new Error(`Failed to find person by email: ${error.message}`);
        }
    }

    async update(uid: string, personData: UpdatePersonData): Promise<Person> {
        try {
            await PersonModel.update(personData, { where: { uid } });

            const updatedPerson = await this.findByUid(uid);
            if (!updatedPerson) {
                throw new Error('Person not found after update');
            }

            return updatedPerson;
        } catch (error: any) {
            throw new Error(`Failed to update person: ${error.message}`);
        }
    }

    async delete(uid: string): Promise<boolean> {
        try {
            const deletedCount = await PersonModel.destroy({ where: { uid } });
            return deletedCount > 0;
        } catch (error: any) {
            throw new Error(`Failed to delete person: ${error.message}`);
        }
    }

    async findAll(): Promise<Person[]> {
        try {
            const personModels = await PersonModel.findAll({
                order: [['firstName', 'ASC'], ['lastName', 'ASC']]
            });
            return personModels.map(person => this.mapToEntity(person));
        } catch (error: any) {
            throw new Error(`Failed to find persons: ${error.message}`);
        }
    }

    async findAllPublic(): Promise<PersonResponse[]> {
        try {
            const personModels = await PersonModel.findAll({
                where: { isActive: true },
                order: [['firstName', 'ASC'], ['lastName', 'ASC']]
            });
            return personModels.map(person => this.mapToPublicEntity(person));
        } catch (error: any) {
            throw new Error(`Failed to find persons: ${error.message}`);
        }
    }

    async findActive(): Promise<PersonResponse[]> {
        try {
            const personModels = await PersonModel.findAll({
                where: { isActive: true },
                order: [['firstName', 'ASC']]
            });
            return personModels.map(person => this.mapToPublicEntity(person));
        } catch (error: any) {
            throw new Error(`Failed to find active persons: ${error.message}`);
        }
    }

    async findInactive(): Promise<PersonResponse[]> {
        try {
            const personModels = await PersonModel.findAll({
                where: { isActive: false },
                order: [['firstName', 'ASC']]
            });
            return personModels.map(person => this.mapToPublicEntity(person));
        } catch (error: any) {
            throw new Error(`Failed to find inactive persons: ${error.message}`);
        }
    }

    // Mapeia modelo para entidade completa
    private mapToEntity(personModel: any): Person {
        return {
            uid: personModel.uid,
            firstName: personModel.firstName,
            lastName: personModel.lastName,
            birthDate: personModel.birthDate,
            document: personModel.document,
            email: personModel.email,
            phone: personModel.phone,
            address: personModel.address,
            isActive: personModel.isActive,
            createdByUserUid: personModel.createdByUserUid,
            createdAt: personModel.createdAt,
            updatedByUserUid: personModel.updatedByUserUid,
            updatedAt: personModel.updatedAt
        };
    }

    // Mapeia para resposta pública - sem dados sensíveis
    private mapToPublicEntity(personModel: any): PersonResponse {
        return {
            uid: personModel.uid,
            firstName: personModel.firstName,
            lastName: personModel.lastName,
            fullName: `${personModel.firstName} ${personModel.lastName}`,
            birthDate: personModel.birthDate,
            address: personModel.address,
            isActive: personModel.isActive,
            createdAt: personModel.createdAt,
            updatedAt: personModel.updatedAt
        };
    }
}