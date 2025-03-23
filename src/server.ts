import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupRoutes } from './routes';
import { setupDatabase } from './config/database';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Setup routes
setupRoutes(app);

// Database initialization
setupDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
