import { Request, Response } from 'express';
import { PersonService } from '../services/person.service';

export class PersonController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const person = await PersonService.createPerson(req.body);
            res.status(201).json(person);
        } catch (error: any) {
            res.status(400).json({ error: 'Failed to create person', message: error.message });
        }
    }

    static async list(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;
            const result = await PersonService.listPersons(
                filters,
                Number(page),
                Number(limit)
            );
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to fetch persons', message: error.message });
        }
    }

    static async getByUid(req: Request, res: Response): Promise<void> {
        try {
            const person = await PersonService.getPersonWithRelations(req.params.uid);
            res.json(person);
        } catch (error: any) {
            res.status(404).json({ error: 'Person not found', message: error.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const updatedPerson = await PersonService.updatePerson(req.params.uid, req.body);
            res.json(updatedPerson);
        } catch (error: any) {
            if (error.message === 'Pessoa não encontrada') {
                res.status(404).json({ error: 'Person not found', message: error.message });
            } else {
                res.status(400).json({ error: 'Failed to update person', message: error.message });
            }
        }
    }

    static async inactivate(req: Request, res: Response): Promise<void> {
        try {
            const inactivated = await PersonService.inactivatePerson(req.params.uid);
            if (!inactivated) {
                res.status(404).json({ error: 'Person not found' });
                return;
            }
            res.json({ message: 'Person inactivated successfully' });
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to inactivate person', message: error.message });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await PersonService.deletePerson(req.params.uid);
            if (!deleted) {
                res.status(404).json({ error: 'Person not found' });
                return;
            }
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to delete person', message: error.message });
        }
    }
}