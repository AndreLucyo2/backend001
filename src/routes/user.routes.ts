import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

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
    '/deactivate',authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await UserController.deactivate(req, res);
        } catch (error) {
            next(error);
        }
    }
);

userRouter.get(
    '/list', authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await UserController.list(req, res);
        } catch (error) {
            next(error);
        }
    }
);