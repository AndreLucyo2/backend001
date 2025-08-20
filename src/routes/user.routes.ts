import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.post(
    '/register',
    UserController.validations.register,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await UserController.register(req, res);
        } catch (error) {
            next(error);
        }
    }
);

userRouter.patch(
    '/deactivate',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await UserController.deactivate(req, res);
        } catch (error) {
            next(error);
        }
    }
);

userRouter.get(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await UserController.list(req, res);
        } catch (error) {
            next(error);
        }
    }
);