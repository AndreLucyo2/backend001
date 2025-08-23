import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { body, validationResult } from 'express-validator';

export class UserController {
    public static validations = {
        register: [
            body('email').isEmail().normalizeEmail(),
            body('password').isLength({ min: 6 }),
            body('name').trim().notEmpty(),
        ],
    };

    public static async register(req: Request, res: Response): Promise<Response> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, name } = req.body;
            const user = await UserService.register(email, password, name);

            return res.status(201).json({
                message: 'User registered successfully',
                user: {
                    uid: user.uid,
                    email: user.email,
                    name: user.name,
                },
            });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public static async deactivate(req: Request, res: Response): Promise<Response> {
        try {
            const { uid } = req.body;
            await UserService.deactivateUser(uid);
            return res.status(200).json({ message: 'User deactivated successfully' });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public static async list(req: Request, res: Response): Promise<Response> {
        try {
            const { name, email } = req.query;
            const users = await UserService.listUsers({ name: name as string, email: email as string });
            return res.status(200).json(users);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
}