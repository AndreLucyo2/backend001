# Modern Node.js REST API

A modern REST API built with Node.js, TypeScript, Express, and SQLite following clean architecture principles.

## Project Structure

```
src/
├── config/         # Configuration files (database, env, etc.)
├── controllers/    # Request handlers
├── middleware/     # Custom middleware (auth, validation, etc.)
├── models/         # Database models
├── routes/         # API routes
└── services/       # Business logic
```

## Features

- TypeScript for type safety
- Clean Architecture principles
- JWT Authentication
- SQLite database with Sequelize ORM
- Express.js for routing
- Input validation with express-validator
- Security middleware with helmet
- CORS enabled
- Environment variables support

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

#### Register a new user

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Scripts

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Build the TypeScript code
- `npm start`: Start the production server
- `npm run kill-server`: Kill the development server
- `npm run restart`: Restart the development server

### Matar servidor pelo terminal

No Windows, podemos usar o comando para listar e matar o processo que está usando a porta do servidor, por exemplo 3000:

```bash
netstat -ano | findstr :3000
```

```bash
netstat -ano | findstr :3000
  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       28608
  TCP    [::]:3000              [::]:0                 LISTENING       28608
  TCP    [::1]:3000             [::1]:65504            TIME_WAIT       0
  TCP    [::1]:65503            [::1]:3000             TIME_WAIT       0
PS ***\projeto-IA-001\backend001> taskkill /F /PID 28608
```

## Testes via Cliente Postman

### 1. Registrar Novo Usuário

- **Método**: `POST`
- **URL**: `http://localhost:3000/api/auth/register`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body (raw JSON)**:

```json
{
  "name": "Usuário Teste",
  "email": "usuario@teste.com",
  "password": "senha123"
}
```

- **Resposta Esperada (200 OK)**:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "usuario@teste.com",
    "name": "Usuário Teste"
  },
  "token": "seu_jwt_token_aqui"
}
```

### 2. Login de Usuário

- **Método**: `POST`
- **URL**: `http://localhost:3000/api/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body (raw JSON)**:

```json
{
  "email": "usuario@teste.com",
  "password": "senha123"
}
```

- **Resposta Esperada (200 OK)**:

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "usuario@teste.com",
    "name": "Usuário Teste"
  },
  "token": "seu_jwt_token_aqui"
}
```

### Observações Importantes

1. O token JWT retornado deve ser guardado para futuras requisições autenticadas
2. Em caso de erro, a API retornará status codes apropriados (400, 401, etc.) com mensagens descritivas
3. Todas as senhas são automaticamente hasheadas antes de serem salvas no banco
4. O banco SQLite é criado automaticamente no diretório raiz do projeto
