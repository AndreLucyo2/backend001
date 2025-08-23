import { Express } from 'express';
import { authRouter } from './auth.routes';
import { personRoutes } from './person.routes';
import { userRouter } from './user.routes';

export function setupRoutes(app: Express): void {
  app.use('/api/auth', authRouter);
  app.use('/api/person', personRoutes);
  app.use('/api/users', userRouter);
}
