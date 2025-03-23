# Documentação dos Serviços

## AuthService (auth.service.ts)

O `AuthService` é responsável pela lógica de autenticação da aplicação, implementando os processos de registro e login de usuários.

### Estrutura da Classe

- Utiliza métodos estáticos para evitar instanciação
- Separa claramente as responsabilidades de registro e login
- Encapsula a geração de token em um método privado

### Métodos Principais

#### `private static generateToken`

- Gera token JWT com ID do usuário
- Usa chave secreta das variáveis de ambiente
- Define expiração de 24 horas para o token

#### `public static register`

```typescript
async register(email: string, password: string, name: string): Promise<{ user: User; token: string }>
```

- Verifica duplicidade de email
- Cria usuário via Sequelize
- Senha hasheada automaticamente
- Retorna usuário + token JWT

#### `public static login`

```typescript
async login(email: string, password: string): Promise<{ user: User; token: string }>
```

- Busca usuário por email
- Verifica senha com bcrypt
- Usa mensagens genéricas por segurança
- Retorna usuário + token JWT

### Aspectos de Segurança

1. **Proteção de Dados**

   - Nunca retorna senhas
   - Usa comparação segura com bcrypt
   - Tokens com expiração
   - Validação prévia dos dados

2. **Tratamento de Erros**

   - Erros específicos tratados no controller
   - Mensagens genéricas para segurança
   - Respostas consistentes

### Princípios SOLID Aplicados

1. **Single Responsibility**

   - Cada método tem responsabilidade única
   - Separação clara de funções

2. **Open/Closed**

   - Fácil extensão sem modificar código existente
   - Estrutura modular

3. **Interface Segregation**

   - API pública bem definida
   - Métodos com propósitos claros

4. **Dependency Inversion**

   - Depende de abstrações (modelo User)
   - Evita acoplamento direto
  