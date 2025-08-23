// Entidade User principal
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Para criação de usuário (sem id, dates)
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

// Para atualização (campos opcionais)
export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

// Para resposta (sem password)
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}