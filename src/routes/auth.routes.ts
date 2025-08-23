import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { DIContainer } from '../container/DIContainer';

export const authRouter = Router();

// Criar instância do controller usando DI
const authController = DIContainer.createAuthController();

//Permite registrar novos usuários e fazer login
authRouter.post(
  '/register',
  AuthController.validations.register,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.register(req, res);
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
      await authController.login(req, res);
    } catch (error) {
      next(error);
    }
  }
);