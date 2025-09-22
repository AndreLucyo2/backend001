# API Documentation

## Índice
- [Informações Gerais](#informações-gerais)
- [Autenticação](#autenticação)
- [Auth Routes](#-auth-routes)
- [User Routes](#-user-routes)
- [Person Routes](#-person-routes)
- [Address Routes](#-address-routes)
- [Padrões de Resposta](#-padrões-de-resposta)

---

## Informações Gerais

### Base URL
```
/api/v1
```

### Content-Type
```
Content-Type: application/json
```

---

## Autenticação

Para rotas que requerem autenticação, incluir o header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth Routes

Base path: `/api/v1/auth`

### POST /auth/register

**Descrição:** Registrar novo usuário  
**Autenticação:** ❌ Não requerida  

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456",
  "personUid": "optional-person-uuid"
}
```

**Validações:**
- `name`: obrigatório, não pode estar vazio
- `email`: deve ser um email válido
- `password`: mínimo 3 caracteres
- `personUid`: opcional

**Response Success (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@email.com",
    "isActive": true,
    "personUid": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /auth/login

**Descrição:** Fazer login  
**Autenticação:** ❌ Não requerida  

**Request Body:**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Validações:**
- `email`: deve ser um email válido
- `password`: obrigatório

**Response Success (200):**
```json
{
  "message": "Login successful",
  "user": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@email.com",
    "isActive": true,
    "personUid": null
  },
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 User Routes

Base path: `/api/v1/users`

### POST /users/register

**Descrição:** Registrar usuário (requer autenticação)  
**Autenticação:** ✅ Requerida  

**Request Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "password": "123456"
}
```

**Validações:**
- `name`: obrigatório, não pode estar vazio
- `email`: deve ser um email válido
- `password`: mínimo 3 caracteres

---

### GET /users/list

**Descrição:** Listar usuários  
**Autenticação:** ✅ Requerida  

**Query Parameters:**
- `name` (string, opcional): Filtrar por nome
- `email` (string, opcional): Filtrar por email

**Exemplo de Request:**
```
GET /api/v1/users/list?name=João&email=joao@email.com
```

**Response Success (201):**
```json
{
  "message": "success",
  "success": true,
  "content": [
    {
      "uid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao@email.com",
      "isActive": true,
      "personUid": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /users/:uid

**Descrição:** Buscar usuário por UID  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID do usuário

**Exemplo de Request:**
```
GET /api/v1/users/550e8400-e29b-41d4-a716-446655440000
```

**Response Success (200):**
```json
{
  "user": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@email.com",
    "isActive": true,
    "personUid": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "success",
  "success": true
}
```

---

### PATCH /users/deactivate

**Descrição:** Desativar usuário  
**Autenticação:** ✅ Requerida  

**Request Body:**
```json
{
  "uid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Success (200):**
```json
{
  "message": "User deactivated successfully",
  "success": true
}
```

---

### PATCH /users/activate

**Descrição:** Ativar usuário  
**Autenticação:** ✅ Requerida  

**Request Body:**
```json
{
  "uid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Success (200):**
```json
{
  "message": "User activated successfully",
  "success": true
}
```

---

## 👥 Person Routes

Base path: `/api/v1/persons`

### POST /persons/create

**Descrição:** Criar nova pessoa  
**Autenticação:** ✅ Requerida  

**Request Body:**
```json
{
  "name": "Carlos Oliveira",
  "document": "12345678901",
  "phone": "(11) 3333-4444",
  "celPhone": "(11) 99999-8888",
  "address": "Rua das Flores, 123"
}
```

**Validações:**
- `name`: obrigatório, não pode estar vazio
- `document`: 11-14 dígitos numéricos (CPF ou CNPJ)
- `phone`: opcional
- `celPhone`: opcional
- `address`: opcional

**Response Success (201):**
```json
{
  "message": "Person created successfully",
  "person": {
    "uid": "660f9400-f39c-52e5-b827-557766551111",
    "name": "Carlos Oliveira",
    "document": "12345678901",
    "phone": "(11) 3333-4444",
    "celPhone": "(11) 99999-8888",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### GET /persons/list

**Descrição:** Listar todas as pessoas  
**Autenticação:** ✅ Requerida  

**Exemplo de Request:**
```
GET /api/v1/persons/list
```

---

### GET /persons/search

**Descrição:** Buscar pessoas com filtros  
**Autenticação:** ✅ Requerida  

**Query Parameters:**
- `name` (string, opcional): Filtrar por nome
- `document` (string, opcional): Filtrar por documento
- `email` (string, opcional): Filtrar por email
- `phone` (string, opcional): Filtrar por telefone
- `celPhone` (string, opcional): Filtrar por celular
- `orderBy` (string, opcional): name | document | email
- `orderDirection` (string, opcional): ASC | DESC
- `page` (number, opcional): Número da página
- `limit` (number, opcional): Limite de itens por página

**Exemplo de Request:**
```
GET /api/v1/persons/search?name=Carlos&orderBy=name&orderDirection=ASC&page=1&limit=10
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Busca realizada com sucesso",
  "data": [
    {
      "uid": "660f9400-f39c-52e5-b827-557766551111",
      "name": "Carlos Oliveira",
      "document": "12345678901",
      "isActive": true
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET /persons/:uid

**Descrição:** Buscar pessoa por UID  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID da pessoa

**Exemplo de Request:**
```
GET /api/v1/persons/660f9400-f39c-52e5-b827-557766551111
```

---

### PUT /persons/:uid

**Descrição:** Atualizar pessoa  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID da pessoa

**Request Body:**
```json
{
  "name": "Carlos Oliveira Santos",
  "document": "12345678901",
  "phone": "(11) 3333-5555",
  "celPhone": "(11) 99999-7777",
  "address": "Rua das Rosas, 456"
}
```

**Validações:**
- Todos os campos são opcionais
- `document`: se fornecido, deve ter 11-14 dígitos numéricos

**Response Success (200):**
```json
{
  "message": "Person updated successfully",
  "person": {
    "uid": "660f9400-f39c-52e5-b827-557766551111",
    "name": "Carlos Oliveira Santos",
    "document": "12345678901",
    "phone": "(11) 3333-5555",
    "celPhone": "(11) 99999-7777",
    "isActive": true,
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

---

### DELETE /persons/:uid

**Descrição:** Deletar pessoa  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID da pessoa

**Exemplo de Request:**
```
DELETE /api/v1/persons/660f9400-f39c-52e5-b827-557766551111
```

**Response Success (204):** Sem conteúdo

---

## 🏠 Address Routes

Base path: `/api/v1/addresses`

### POST /addresses/create

**Descrição:** Criar novo endereço  
**Autenticação:** ✅ Requerida  

**Request Body:**
```json
{
  "personUid": "660f9400-f39c-52e5-b827-557766551111",
  "street": "Rua das Palmeiras",
  "number": "123",
  "neighborhood": "Centro",
  "zipCode": "01234-567",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "observation": "Próximo ao shopping"
}
```

**Validações:**
- `personUid`: obrigatório, deve ser um UUID válido
- `street`: obrigatório, não pode estar vazio
- `city`: obrigatório, não pode estar vazio
- `state`: obrigatório, não pode estar vazio
- `country`: opcional
- `number`: opcional
- `neighborhood`: opcional
- `zipCode`: opcional
- `observation`: opcional

**Response Success (201):**
```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "uid": "770a1500-a40d-63f6-c938-668877662222",
    "street": "Rua das Palmeiras",
    "number": "123",
    "neighborhood": "Centro",
    "zipCode": "01234-567",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "observation": "Próximo ao shopping",
    "isPrimary": false,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### GET /addresses/:uid

**Descrição:** Buscar endereço por UID  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID do endereço

**Exemplo de Request:**
```
GET /api/v1/addresses/770a1500-a40d-63f6-c938-668877662222
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Address found",
  "data": {
    "uid": "770a1500-a40d-63f6-c938-668877662222",
    "street": "Rua das Palmeiras",
    "number": "123",
    "neighborhood": "Centro",
    "zipCode": "01234-567",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "observation": "Próximo ao shopping",
    "isPrimary": false,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### PUT /addresses/:uid

**Descrição:** Atualizar endereço  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID do endereço

**Request Body:**
```json
{
  "street": "Rua das Palmeiras Novas",
  "number": "456",
  "neighborhood": "Centro",
  "zipCode": "01234-567",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "observation": "Apartamento 101",
  "isPrimary": true
}
```

**Validações:**
- Todos os campos são opcionais
- `isPrimary`: se fornecido, deve ser boolean

**Response Success (200):**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "uid": "770a1500-a40d-63f6-c938-668877662222",
    "street": "Rua das Palmeiras Novas",
    "number": "456",
    "neighborhood": "Centro",
    "zipCode": "01234-567",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "observation": "Apartamento 101",
    "isPrimary": true,
    "isActive": true,
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

---

### DELETE /addresses/:uid

**Descrição:** Deletar endereço  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID do endereço

**Exemplo de Request:**
```
DELETE /api/v1/addresses/770a1500-a40d-63f6-c938-668877662222
```

**Response Success (204):** Sem conteúdo

---

### GET /addresses/person/:personUid

**Descrição:** Listar endereços de uma pessoa  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `personUid` (string): UID da pessoa

**Exemplo de Request:**
```
GET /api/v1/addresses/person/660f9400-f39c-52e5-b827-557766551111
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Addresses found",
  "data": [
    {
      "uid": "770a1500-a40d-63f6-c938-668877662222",
      "street": "Rua das Palmeiras",
      "number": "123",
      "neighborhood": "Centro",
      "zipCode": "01234-567",
      "city": "São Paulo",
      "state": "SP",
      "country": "Brasil",
      "isPrimary": true,
      "isActive": true
    }
  ]
}
```

---

### PUT /addresses/person/:personUid/primary/:addressUid

**Descrição:** Definir endereço principal da pessoa  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `personUid` (string): UID da pessoa
- `addressUid` (string): UID do endereço

**Exemplo de Request:**
```
PUT /api/v1/addresses/person/660f9400-f39c-52e5-b827-557766551111/primary/770a1500-a40d-63f6-c938-668877662222
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Primary address set successfully",
  "data": null
}
```

---

### PUT /addresses/:uid/deactivate

**Descrição:** Desativar endereço  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID do endereço

**Exemplo de Request:**
```
PUT /api/v1/addresses/770a1500-a40d-63f6-c938-668877662222/deactivate
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Address deactivated successfully",
  "data": null
}
```

---

### PUT /addresses/:uid/activate

**Descrição:** Ativar endereço  
**Autenticação:** ✅ Requerida  

**Path Parameters:**
- `uid` (string): UID do endereço

**Exemplo de Request:**
```
PUT /api/v1/addresses/770a1500-a40d-63f6-c938-668877662222/activate
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Address activated successfully",
  "data": null
}
```

---

## 📝 Padrões de Resposta

### Response de Sucesso
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Response de Erro
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

### Response de Erro de Validação
```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Response Paginada
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## Status Codes

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 204 | No Content - Requisição bem-sucedida, sem conteúdo de retorno |
| 400 | Bad Request - Erro de validação ou dados inválidos |
| 401 | Unauthorized - Token de autenticação inválido ou ausente |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro interno do servidor |

---

## Observações

1. **Autenticação**: Todas as rotas que requerem autenticação devem incluir o header `Authorization: Bearer <token>`
2. **UUIDs**: Todos os identificadores (`uid`) são UUIDs v4
3. **Timestamps**: Todas as datas seguem o formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
4. **Validações**: Os erros de validação retornam um array com detalhes específicos sobre cada campo inválido
5. **Paginação**: A busca de pessoas suporta paginação com os parâmetros `page` e `limit`