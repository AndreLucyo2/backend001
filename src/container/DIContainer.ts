import { IUserRepository } from '../interfaces/IUserRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';

// Padrão Singleton para repository

// Centraliza criação de objetos e suas dependências
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
}