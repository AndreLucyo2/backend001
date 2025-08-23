import { IUserRepository } from '../interfaces/IUserRepository';
import { User, CreateUserData, UpdateUserData } from '../types/UserTypes';
import { User as UserModel } from '../models/user';

export class UserRepository implements IUserRepository {

    async create(userData: CreateUserData): Promise<User> {
        try {
            const userModel = await UserModel.create(userData);
            return this.mapToEntity(userModel);
        } catch (error: any) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    async findById(id: number): Promise<User | null> {
        try {
            const userModel = await UserModel.findByPk(id);
            return userModel ? this.mapToEntity(userModel) : null;
        } catch (error: any) {
            throw new Error(`Failed to find user by ID: ${error.message}`);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const userModel = await UserModel.findOne({ where: { email } });
            return userModel ? this.mapToEntity(userModel) : null;
        } catch (error: any) {
            throw new Error(`Failed to find user by email: ${error.message}`);
        }
    }

    async update(id: number, userData: UpdateUserData): Promise<User> {
        try {
            await UserModel.update(userData, { where: { id } });

            const updatedUser = await this.findById(id);
            if (!updatedUser) {
                throw new Error('User not found after update');
            }

            return updatedUser;
        } catch (error: any) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            const deletedCount = await UserModel.destroy({ where: { id } });
            return deletedCount > 0;
        } catch (error: any) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    async findAll(): Promise<User[]> {
        try {
            const userModels = await UserModel.findAll({
                order: [['createdAt', 'DESC']]
            });
            return userModels.map(user => this.mapToEntity(user));
        } catch (error: any) {
            throw new Error(`Failed to find users: ${error.message}`);
        }
    }

    // Converte modelo Sequelize para entidade limpa
    private mapToEntity(userModel: any): User {
        return {
            id: userModel.id,
            name: userModel.name,
            email: userModel.email,
            password: userModel.password,
            createdAt: userModel.createdAt,
            updatedAt: userModel.updatedAt
        };
    }
}