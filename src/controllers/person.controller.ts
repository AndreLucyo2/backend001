import { Request, Response } from 'express';
import { Person } from '../models/person';

export class PersonController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const person = await Person.create(req.body);
            res.status(200).json(person);
        } catch (error) {
            res.status(400).json({ error: 'Failed to create person', details: error });
        }
    }

    static async list(_req: Request, res: Response): Promise<void> {
        try {
            const persons = await Person.findAll();
            res.json(persons);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch persons', details: error });
        }
    }

    static async getByUid(req: Request, res: Response): Promise<void> {
        try {
            const person = await Person.findByPk(req.params.uid);
            if (!person) {
                res.status(404).json({ error: 'Person not found' });
                return;
            }
            res.json(person);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch person', details: error });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const [updated] = await Person.update(req.body, {
                where: { uid: req.params.uid },
            });
            if (!updated) {
                res.status(404).json({ error: 'Person not found' });
                return;
            }
            const updatedPerson = await Person.findByPk(req.params.uid);
            res.json(updatedPerson);
        } catch (error) {
            res.status(400).json({ error: 'Failed to update person', details: error });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await Person.destroy({
                where: { uid: req.params.uid },
            });
            if (!deleted) {
                res.status(404).json({ error: 'Person not found' });
                return;
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete person', details: error });
        }
    }
}