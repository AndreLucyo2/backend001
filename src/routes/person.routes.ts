import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { DIContainer } from '../container/DIContainer';

export const personRoutes = Router();

// Criar instância do controller usando Dependency Injection
const personController = DIContainer.createPersonController();

personRoutes.post(
    '/create',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await personController.create(req, res);
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
            await personController.list(req, res);
        } catch (error) {
            next(error);
        }
    }
);

personRoutes.get(
    '/search',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await personController.searchPersons(req, res);
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
            await personController.getByUid(req, res);
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
            await personController.update(req, res);
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
            await personController.delete(req, res);
        } catch (error) {
            next(error);
        }
    }
);