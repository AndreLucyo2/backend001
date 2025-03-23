import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export class AuthService {
  private static generateToken(userUid: string): string {
    return jwt.sign({ uid: userUid }, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });
  }

  public static async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; token: string }> {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await User.create({
      email,
      password,
      name,
    });

    const token = this.generateToken(user.uid);
    return { user, token };
  }

  public static async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.uid);
    return { user, token };
  }
}
