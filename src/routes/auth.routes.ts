import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const authRouter = Router();

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
