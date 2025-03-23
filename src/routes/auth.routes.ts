import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post(
  '/register',
  AuthController.validations.register,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthController.register(req, res);
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  '/login',
  AuthController.validations.login,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthController.login(req, res);
    } catch (error) {
      next(error);
    }
  }
);
