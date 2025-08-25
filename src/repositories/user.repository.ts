import { IUserRepository } from '../interfaces/IUserRepository';
import { User, CreateUserData, UpdateUserData, UserResponse } from '../types/user.types';
import { User as UserModel } from '../models/user';

export class UserRepository implements IUserRepository {

	async create(userData: CreateUserData): Promise<User> {
		try {
			const userModel = await UserModel.create(userData as any);
			return this.mapToEntity(userModel);
		} catch (error: any) {
			throw new Error(`Failed to create user: ${error.message}`);
		}
	}

	async findByUid(uid: string): Promise<User | null> {
		try {
			const userModel = await UserModel.findByPk(uid);
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

	async update(uid: string, userData: UpdateUserData): Promise<User> {
		try {
			await UserModel.update(userData, { where: { uid } });

			const updatedUser = await this.findByUid(uid);
			if (!updatedUser) {
				throw new Error('User not found after update');
			}

			return updatedUser;
		} catch (error: any) {
			throw new Error(`Failed to update user: ${error.message}`);
		}
	}

	async delete(uid: string): Promise<boolean> {
		try {
			const deletedCount = await UserModel.destroy({ where: { uid } });
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

	async findAllPublic(): Promise<UserResponse[]> {
		try {
			const userModels = await UserModel.findAll({
				order: [['createdAt', 'DESC']]
			});
			return userModels.map(user => this.mapToPublicEntity(user));
		} catch (error: any) {
			throw new Error(`Failed to find users: ${error.message}`);
		}
	}

	// Converte modelo Sequelize para entidade limpa
	private mapToEntity(userModel: any): User {
		return {
			uid: userModel.uid,
			name: userModel.name,
			email: userModel.email,
			isActive: userModel.isActive,
			personUid: userModel.personUid,
			password: userModel.password, // Mantém internamente para validações
			createdAt: userModel.createdAt,
			updatedAt: userModel.updatedAt
		};
	}

	// Novo método para respostas públicas (sem senha)
	private mapToPublicEntity(userModel: any): UserResponse {
		return {
			uid: userModel.uid,
			name: userModel.name,
			email: userModel.email,
			isActive: userModel.isActive,
			personUid: userModel.personUid,
			createdAt: userModel.createdAt,
			updatedAt: userModel.updatedAt
		};
	}
}