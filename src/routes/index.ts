import { Express } from 'express';
import { authRouter } from './auth.routes';
import { personRoutes } from './person.routes';
import { userRouter } from './user.routes';

export function setupRoutes(app: Express): void {
	app.use('/api/v1/auth', authRouter);
	app.use('/api/v1/person', personRoutes);
	app.use('/api/v1/users', userRouter);
}
