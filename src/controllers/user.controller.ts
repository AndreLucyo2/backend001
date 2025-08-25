import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { body, validationResult } from 'express-validator';

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    public static validations = {
        register: [
            body('email').isEmail().normalizeEmail(),
            body('password').isLength({ min: 3 }),
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
                success: true,
                user: user, // Já retorna UserResponse sem senha
            });

        } catch (error: any) {
            return res.status(400).json({ message: error.message, success: false });
        }
    }

    public getByUid = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { uid } = req.params;
            const user = await this.userService.getByUid(uid);

            return res.status(200).json({
                user: user,
                message: 'success',
                success: true
            });

        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public deactivate = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { uid } = req.body;
            await this.userService.deactivateUser(uid);

            return res.status(200).json({
                message: 'User deactivated successfully',
                success: true,
            });

        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public activate = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { uid } = req.body;
            await this.userService.activateUser(uid);

            return res.status(200).json({
                message: 'User activated successfully',
                success: true,
            });

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
            return res.status(201).json({
                message: 'success',
                success: true,
                content: users, // Já retorna UserResponse[] sem senhas
            });

        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
}