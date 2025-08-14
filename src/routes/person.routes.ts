import { Router } from 'express';
import { PersonController } from '../controllers/person.controller';

export const personRoutes = Router();

personRoutes.post('/create', PersonController.create);
personRoutes.get('/list', PersonController.list);
personRoutes.get('/:uid', PersonController.getByUid);
personRoutes.put('/:uid', PersonController.update);
personRoutes.delete('/:uid', PersonController.delete);