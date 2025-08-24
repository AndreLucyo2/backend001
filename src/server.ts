import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupRoutes } from './routes';
import { setupDatabase } from './config/database';
import { APP_VERSION } from "./version";


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

      console.log(`Servidor iniciado na versão ${APP_VERSION}`);
      console.log(`Server is running on port ${port}`);
      console.log(`CTRL+C to end running server`);
      
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
