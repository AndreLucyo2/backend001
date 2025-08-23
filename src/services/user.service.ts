import { IUserRepository } from '../interfaces/IUserRepository';
import { CreateUserData, UserResponse, UpdateUserData } from '../types/UserTypes';

export class UserService {
    constructor(private userRepository: IUserRepository) { }

    public async register(email: string, password: string, name: string): Promise<UserResponse> {
        // Verificar se email já existe
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Criar usuário
        const userData: CreateUserData = { email, password, name };
        const user = await this.userRepository.create(userData);

        // Retornar sem senha
        const userResponse: UserResponse = {
            uid: user.uid,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            personUid: user.personUid,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return userResponse;
    }

    public async deactivateUser(uid: string): Promise<void> {
        // Verificar se usuário existe
        const user = await this.userRepository.findByUid(uid);
        if (!user) {
            throw new Error('User not found');
        }

        // Desativar usuário
        const updateData: UpdateUserData = { isActive: false };
        await this.userRepository.update(uid, updateData);
    }

    public async listUsers(query: { name?: string; email?: string }): Promise<UserResponse[]> {
        // Por enquanto, retorna todos
        return await this.userRepository.findAllPublic();
        
        // TODO: Implementar filtros por name/email no repository
        // if (query.name || query.email) {
        //     return await this.userRepository.findByFilters(query);
        // }
    }
}
