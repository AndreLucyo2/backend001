import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../interfaces/IUserRepository';
import { CreateUserData, UserResponse } from '../types/user.types';

export class AuthService {
  constructor(private userRepository: IUserRepository) { }

  private generateToken(userUid: string): string {
    return jwt.sign({ uid: userUid }, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });
  }

  public async register(userData: CreateUserData): Promise<{ user: UserResponse; token: string }> {
    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Criar usuário (senha será hasheada pelo hook do modelo)
    const user = await this.userRepository.create(userData);

    // Gerar token
    const token = this.generateToken(user.uid);

    // Retornar sem a senha
    const userResponse: UserResponse = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      personUid: user.personUid,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return { user: userResponse, token };
  }

  public async login(email: string, password: string): Promise<{ user: UserResponse; token: string }> {
    // Buscar usuário por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Comparar senha (usando bcrypt diretamente)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Gerar token
    const token = this.generateToken(user.uid);

    // Retornar sem a senha
    const userResponse: UserResponse = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      personUid: user.personUid,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return { user: userResponse, token };
  }
}