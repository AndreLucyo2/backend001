import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { DIContainer } from '../container/DIContainer';

export const userRouter = Router();

// Criar instância do controller usando Dependency Injection
const userController = DIContainer.createUserController();

userRouter.post(
	'/register',
	authMiddleware,
	UserController.validations.register,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await userController.register(req, res);
		} catch (error) {
			next(error);
		}
	}
);

userRouter.patch(
	'/deactivate',
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await userController.deactivate(req, res);
		} catch (error) {
			next(error);
		}
	}
);

userRouter.patch(
	'/activate',
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await userController.activate(req, res);
		} catch (error) {
			next(error);
		}
	}
);

userRouter.get(
	'/list',
	authMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await userController.list(req, res);
		} catch (error) {
			next(error);
		}
	}
);