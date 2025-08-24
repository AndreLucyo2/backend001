import { Request, Response } from 'express';
import { PersonService } from '../services/person.service';
import { body, validationResult } from 'express-validator';

export class PersonController {
    constructor(private personService: PersonService) { }

    public static validations = {
        create: [
            body('firstName').notEmpty().trim(),
            body('lastName').notEmpty().trim(),
            body('document').isLength({ min: 11, max: 14 }).isNumeric(),
            body('birthDate').optional().isISO8601(),
            body('phone').optional().trim(),
            body('address').optional().trim(),
        ],
        update: [
            body('firstName').optional().trim(),
            body('lastName').optional().trim(),
            body('document').optional().isLength({ min: 11, max: 14 }).isNumeric(),
            body('birthDate').optional().isISO8601(),
            body('phone').optional().trim(),
            body('address').optional().trim(),
        ]
    };

    public create = async (req: Request, res: Response): Promise<Response> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const person = await this.personService.createPerson(req.body, req.user?.uid ?? "");
            return res.status(201).json({
                message: 'Person created successfully',
                person
            });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public getByUid = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { uid } = req.params;
            const person = await this.personService.getPersonByUid(uid);
            return res.json(person);
        } catch (error: any) {
            return res.status(404).json({ message: error.message });
        }
    }

    public update = async (req: Request, res: Response): Promise<Response> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { uid } = req.params;
            const person = await this.personService.updatePerson(uid, req.body, req.user?.uid ?? "");
            return res.json({
                message: 'Person updated successfully',
                person
            });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public async delete(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.personService.deletePerson(req.params.uid);
            if (!deleted) {
                res.status(404).json({ error: 'Person not found' });
                return;
            }
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: 'Failed to delete person', message: error.message });
        }
    }

    public deactivate = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { uid } = req.params;
            await this.personService.deactivatePerson(uid, req.user?.uid ?? "");
            return res.json({ message: 'Person deactivated successfully' });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    public list = async (req: Request, res: Response): Promise<Response> => {
        try {
            const persons = await this.personService.listPersons();
            return res.json(persons);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    public search = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { name } = req.query;
            if (!name) {
                return res.status(400).json({ message: 'Name parameter is required' });
            }

            const persons = await this.personService.searchPersons(name as string);
            return res.json(persons);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
}

// import { Request, Response } from 'express';
// import { PersonService } from '../services/person.service';

// export class PersonController {
//     static async create(req: Request, res: Response): Promise<void> {
//         try {
//             const person = await PersonService.createPerson(req.body);
//             res.status(201).json(person);
//         } catch (error: any) {
//             res.status(400).json({ error: 'Failed to create person', message: error.message });
//         }
//     }

//     static async list(req: Request, res: Response): Promise<void> {
//         try {
//             const { page = 1, limit = 10, ...filters } = req.query;
//             const result = await PersonService.listPersons(
//                 filters,
//                 Number(page),
//                 Number(limit)
//             );
//             res.json(result);
//         } catch (error: any) {
//             res.status(500).json({ error: 'Failed to fetch persons', message: error.message });
//         }
//     }

//     static async getByUid(req: Request, res: Response): Promise<void> {
//         try {
//             const person = await PersonService.getPersonWithRelations(req.params.uid);
//             res.json(person);
//         } catch (error: any) {
//             res.status(404).json({ error: 'Person not found', message: error.message });
//         }
//     }

//     static async update(req: Request, res: Response): Promise<void> {
//         try {
//             const updatedPerson = await PersonService.updatePerson(req.params.uid, req.body);
//             res.json(updatedPerson);
//         } catch (error: any) {
//             if (error.message === 'Pessoa não encontrada') {
//                 res.status(404).json({ error: 'Person not found', message: error.message });
//             } else {
//                 res.status(400).json({ error: 'Failed to update person', message: error.message });
//             }
//         }
//     }

//     static async inactivate(req: Request, res: Response): Promise<void> {
//         try {
//             const inactivated = await PersonService.inactivatePerson(req.params.uid);
//             if (!inactivated) {
//                 res.status(404).json({ error: 'Person not found' });
//                 return;
//             }
//             res.json({ message: 'Person inactivated successfully' });
//         } catch (error: any) {
//             res.status(500).json({ error: 'Failed to inactivate person', message: error.message });
//         }
//     }

//     static async delete(req: Request, res: Response): Promise<void> {
//         try {
//             const deleted = await PersonService.deletePerson(req.params.uid);
//             if (!deleted) {
//                 res.status(404).json({ error: 'Person not found' });
//                 return;
//             }
//             res.status(204).send();
//         } catch (error: any) {
//             res.status(500).json({ error: 'Failed to delete person', message: error.message });
//         }
//     }
// }