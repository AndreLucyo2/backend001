import { Router, Request, Response, NextFunction } from 'express';
import { PersonController } from '../controllers/person.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const personRoutes = Router();

personRoutes.post(
    '/create',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await PersonController.create(req, res);
        } catch (error) {
            next(error);
        }
    }
);

personRoutes.get(
    '/list',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await PersonController.list(req, res);
        } catch (error) {
            next(error);
        }
    }
);

personRoutes.get(
    '/:uid',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await PersonController.getByUid(req, res);
        } catch (error) {
            next(error);
        }
    }
);

personRoutes.put(
    '/:uid',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await PersonController.update(req, res);
        } catch (error) {
            next(error);
        }
    }
);

personRoutes.delete(
    '/:uid',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await PersonController.delete(req, res);
        } catch (error) {
            next(error);
        }
    }
);