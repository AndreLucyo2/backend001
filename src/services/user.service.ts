import { User } from '../models/user';
import { Op } from 'sequelize';

export class UserService {
    public static async register(
        email: string,
        password: string,
        name: string
    ): Promise<User> {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const user = await User.create({
            email,
            password,
            name,
        });

        return user;
    }

    public static async deactivateUser(uid: string): Promise<void> {
        const user = await User.findOne({ where: { uid } });
        if (!user) {
            throw new Error('User not found');
        }
        user.isActive = false;
        await user.save();
    }

    public static async listUsers(query: { name?: string; email?: string }): Promise<User[]> {
        const users = await User.findAll({
            where: {
                ...(query.name && { name: { [Op.like]: `%${query.name}%` } }),
                ...(query.email && { email: { [Op.like]: `%${query.email}%` } }),
            },
            order: [['name', 'ASC']],
        });
        return users;
    }
}