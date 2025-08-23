import jwt from 'jsonwebtoken';
import { User } from '../models/user';

export class AuthService {
  private static generateToken(userUid: string): string {
    return jwt.sign({ uid: userUid }, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });
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
