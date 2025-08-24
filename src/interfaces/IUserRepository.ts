import { User, CreateUserData, UpdateUserData, UserResponse } from '../types/user.types';

// Contrato que define o que um UserRepository deve fazer
export interface IUserRepository {
    // Criar usuário
    create(userData: CreateUserData): Promise<User>;

    // Buscar por UID
    findByUid(uid: string): Promise<User | null>;

    // Buscar por email (para login/validação)
    findByEmail(email: string): Promise<User | null>;

    // Atualizar usuário
    update(uid: string, userData: UpdateUserData): Promise<User>;

    // Deletar usuário
    delete(uid: string): Promise<boolean>;

    // Listar todos
    findAll(): Promise<User[]>;

    // Listar todos (sem senha para resposta pública)
    findAllPublic(): Promise<UserResponse[]>;
}