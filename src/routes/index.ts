import { Express } from 'express';
import { authRouter } from './auth.routes';

export function setupRoutes(app: Express): void {
  app.use('/api/auth', authRouter);
}
