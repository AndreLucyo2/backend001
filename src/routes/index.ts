import { Express } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { personRoutes } from './person.routes';
import { addressRoutes } from './address.routes';

export function setupRoutes(app: Express): void {
	app.use('/api/v1/auth', authRouter);
	app.use('/api/v1/user', userRouter);
	app.use('/api/v1/person', personRoutes);
	app.use('/api/v1/addresses', addressRoutes);
}
