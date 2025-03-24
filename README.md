# Modern Node.js REST API

A modern REST API built with Node.js, TypeScript, Express, and SQLite following clean architecture principles.

## Project Structure

```bash
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

2.Create a `.env` file in the root directory with the following content:

```bash
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3.Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

#### Register a new user

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Deployment Local

Para fazer o deploy em ambiente local, siga os passos:

1. **Build do Projeto**

```bash
npm run build
```

- Compila o código TypeScript para JavaScript
- Gera os arquivos na pasta `dist/`

2.**Preparar pasta de produção**

```bash
# Criar pasta para produção
mkdir backend-prod

# Copiar arquivos necessários
xcopy dist backend-prod\dist /E /I
copy package.json backend-prod\
copy .env backend-prod\
```

3.**Instalar dependências de produção**

```bash
cd backend-prod
npm install --production
```

4.**Criar arquivo de inicialização**

```bash
# Criar arquivo start-server.bat
echo @echo off > start-server.bat
echo echo Iniciando servidor Node.js... >> start-server.bat
echo echo. >> start-server.bat
echo cd /d "%%~dp0" >> start-server.bat
echo node dist/server.js >> start-server.bat
echo pause >> start-server.bat
```

### Executando o Servidor

Após a instalação, você tem duas opções para iniciar o servidor:

1.**Via Terminal**

```bash
npm start
```

2.**Via Arquivo .bat**

- Basta dar duplo clique no arquivo `start-server.bat`
- O servidor iniciará automaticamente
- Uma janela do terminal mostrará o status do servidor
- Para fechar o servidor, basta fechar a janela ou pressionar qualquer tecla

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
