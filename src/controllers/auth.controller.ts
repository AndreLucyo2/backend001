import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { body, validationResult } from 'express-validator';

export class AuthController {
  public static validations = {
    register: [
      body('email').isEmail().normalizeEmail(),
      body('password').isLength({ min: 6 }),
      body('name').trim().notEmpty(),
    ],
    login: [
      body('email').isEmail().normalizeEmail(),
      body('password').notEmpty(),
    ],
  };

  public static async register(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;
      const result = await AuthService.register(email, password, name);

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        token: result.token,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public static async login(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        token: result.token,
      });
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  }
}
