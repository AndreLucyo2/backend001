// routes/address.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { DIContainer } from '../container/DIContainer';

export const addressRoutes = Router();

// Criar instância do controller usando Dependency Injection
const addressController = DIContainer.createAddressController();

// Criar endereço
addressRoutes.post(
    '/create',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.create(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Buscar endereço por UID
addressRoutes.get(
    '/:uid',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.getByUid(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Atualizar endereço
addressRoutes.put(
    '/:uid',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.update(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Deletar endereço
addressRoutes.delete(
    '/:uid',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.delete(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Listar endereços de uma pessoa
addressRoutes.get(
    '/person/:personUid',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.getPersonAddresses(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Definir endereço principal da pessoa
addressRoutes.put(
    '/person/:personUid/primary/:addressUid',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.setPrimaryAddress(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Desativar endereço
addressRoutes.put(
    '/:uid/deactivate',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.deactivate(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Ativar endereço
addressRoutes.put(
    '/:uid/activate',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.activate(req, res);
        } catch (error) {
            next(error);
        }
    }
);