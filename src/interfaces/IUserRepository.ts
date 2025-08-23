import { User, CreateUserData, UpdateUserData } from '../types/UserTypes';

// Contrato que define o que um UserRepository deve fazer
export interface IUserRepository {
    // Criar usuário
    create(userData: CreateUserData): Promise<User>;

    // Buscar por ID
    findById(id: number): Promise<User | null>;

    // Buscar por email (para login/validação)
    findByEmail(email: string): Promise<User | null>;

    // Atualizar usuário
    update(id: number, userData: UpdateUserData): Promise<User>;

    // Deletar usuário
    delete(id: number): Promise<boolean>;

    // Listar todos
    findAll(): Promise<User[]>;
}