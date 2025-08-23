import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { body, validationResult } from 'express-validator';

export class UserController {
    constructor(private userService: UserService) { }

    public static validations = {
        register: [
            body('email').isEmail().normalizeEmail(),
            body('password').isLength({ min: 6 }),
            body('name').trim().notEmpty(),
        ],
    };

    public register = async (req: Request, res: Response): Promise<Response> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, name } = req.body;
            const user = await this.userService.register(email, password, name);

            return res.status(201).json({
                message: 'User registered successfully',
                user: user, // Já retorna UserResponse sem senha
            });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public deactivate = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { uid } = req.body;
            await this.userService.deactivateUser(uid);
            return res.status(200).json({ message: 'User deactivated successfully' });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public list = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { name, email } = req.query;
            const users = await this.userService.listUsers({ 
                name: name as string, 
                email: email as string 
            });
            return res.status(200).json(users); // Já retorna UserResponse[] sem senhas
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
}