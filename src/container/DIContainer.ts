
import { IUserRepository } from '../interfaces/IUserRepository';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';

import { PersonService } from '../services/person.service';
import { PersonController } from '../controllers/person.controller';
import { PersonRepository } from '../repositories/person.repository';
import { IPersonRepository } from '../interfaces/IPersonRepository';

// Centraliza criação de objetos e suas dependências
// DIContainer significa Dependency Injection Container.
export class DIContainer {

    // Singleton: uma instância do repository para toda aplicação
    private static userRepositoryInstance: IUserRepository;

    // Cria ou retorna repository existente
    static getUserRepository(): IUserRepository {
        if (!this.userRepositoryInstance) {
            this.userRepositoryInstance = new UserRepository();
        }
        return this.userRepositoryInstance;
    }

    // Cria AuthService com repository injetado
    static createAuthService(): AuthService {
        const userRepository = this.getUserRepository();
        return new AuthService(userRepository);
    }

    // Cria AuthController com service injetado
    static createAuthController(): AuthController {
        const authService = this.createAuthService();
        return new AuthController(authService);
    }

    // Cria UserService com repository injetado
    static createUserService(): UserService {
        const userRepository = this.getUserRepository();
        return new UserService(userRepository);
    }

    // Cria UserController com service injetado
    static createUserController(): UserController {
        const userService = this.createUserService();
        return new UserController(userService);
    }

    // Singleton: uma instância do repository para toda aplicação
    private static personRepositoryInstance: IPersonRepository;

    static getPersonRepository(): IPersonRepository {
        if (!this.personRepositoryInstance) {
            this.personRepositoryInstance = new PersonRepository();
        }
        return this.personRepositoryInstance;
    }

    static createPersonService(): PersonService {
        const personRepository = this.getPersonRepository();
        return new PersonService(personRepository);
    }

    static createPersonController(): PersonController {
        const personService = this.createPersonService();
        return new PersonController(personService);
    }

}
