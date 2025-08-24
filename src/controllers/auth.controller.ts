import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { body, validationResult } from 'express-validator';

export class AuthController {
  constructor(private authService: AuthService) { }

  public static validations = {
    register: [
      body('name').notEmpty().trim(),
      body('email').isEmail().normalizeEmail(),
      body('password').isLength({ min: 3 }),
    ],
    login: [
      body('email').isEmail().normalizeEmail(),
      body('password').notEmpty(),
    ],
  };

  public register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, personUid } = req.body;
      const result = await this.authService.register({ 
        name, 
        email, 
        password,
        personUid: personUid || null
      });

      return res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await this.authService.login(email, password);

      return res.status(200).json({
        message: 'Login successful',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  }
}