import { Router } from 'express';
import { PersonController } from '../controllers/person.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const personRoutes = Router();

personRoutes.post('/create', authMiddleware, PersonController.create);
personRoutes.get('/list', authMiddleware, PersonController.list);
personRoutes.get('/:uid', authMiddleware, PersonController.getByUid);
personRoutes.put('/:uid', authMiddleware, PersonController.update);
personRoutes.delete('/:uid', authMiddleware, PersonController.delete);