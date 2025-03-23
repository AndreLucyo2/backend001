# Documentação dos Middlewares

## AuthMiddleware (auth.middleware.ts)

O `AuthMiddleware` é um componente crucial para a segurança da API, responsável por validar e processar tokens JWT em requisições que exigem autenticação.

### Estrutura e Tipos

#### Interface JwtPayload

```typescript
interface JwtPayload {
  uid: string;
}
```

- Define a estrutura do payload do token JWT
- Contém o UUID do usuário para maior segurança
- Evita uso de IDs sequenciais previsíveis

#### Extensão do Express Request

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

- Estende a interface Request do Express
- Adiciona a propriedade `user` para acesso em toda a aplicação
- Permite TypeScript reconhecer `req.user` em rotas autenticadas

### Funcionamento do Middleware

#### Função Principal

```typescript
async (req: Request, res: Response, next: NextFunction): Promise<void | Response>
```

1. **Verificação do Header**
   - Extrai o header de autorização
   - Valida o formato "Bearer [token]"
   - Retorna 401 se não encontrado ou formato inválido

2. **Validação do Token**
   - Extrai o token do header
   - Verifica a assinatura usando JWT_SECRET
   - Decodifica o payload para obter o UUID do usuário

3. **Busca do Usuário**
   - Busca o usuário no banco usando o UUID do token
   - Verifica se o usuário ainda existe
   - Retorna 401 se usuário não encontrado

4. **Injeção do Usuário**
   - Adiciona o objeto do usuário à requisição
   - Permite acesso aos dados do usuário nas rotas

### Tratamento de Erros

1. **Erros de Autenticação**
   - Token ausente: "Authentication required"
   - Token inválido: "Invalid token"
   - Usuário não encontrado: "User not found"

2. **Respostas de Erro**
   - Status code 401 para todos os erros
   - Mensagens claras mas sem detalhes sensíveis
   - Formato consistente: `{ message: string }`

### Boas Práticas Implementadas

1. **Segurança**
   - Validação completa do token
   - Uso de UUID em vez de IDs sequenciais
   - Mensagens de erro genéricas
   - Verificação da existência do usuário

2. **Tipagem**
   - Uso completo de TypeScript
   - Interfaces bem definidas
   - Tipos explícitos para parâmetros e retornos

3. **Manutenibilidade**
   - Código modular e reutilizável
   - Funções com responsabilidade única
   - Comentários e estrutura clara

4. **Performance**
   - Verificações em ordem otimizada
   - Uso de async/await para operações assíncronas
   - Retorno antecipado em casos de erro

### Uso em Rotas

```typescript
// Exemplo de uso em uma rota protegida
router.get('/protected', authMiddleware, (req, res) => {
  // req.user está disponível aqui
  const userData = req.user;
});
```

### Observações Importantes

1. O middleware deve ser aplicado em todas as rotas que requerem autenticação
2. O token JWT deve ser incluído no header Authorization de todas as requisições
3. O formato do token deve ser: `Bearer <token_jwt>`
4. Erros de autenticação sempre retornam status 401 (Unauthorized)
5. O uso de UUID como identificador aumenta a segurança da aplicação
