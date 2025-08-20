import { Person } from '../models/person';
import { User } from '../models/user';
import { Op } from 'sequelize';

export class PersonService {
  /**
   * Criar uma nova pessoa com validações de negócio
   * e registrar quem fez o cadastro (createdByUserUid)
   */
  static async createPerson(personData: any, createdByUserUid?: string) {
    // Regra de negócio: Deve ter CPF ou CNPJ, mas nunca ambos e nunca nenhum
    if ((personData.cpf && personData.cnpj) || (!personData.cpf && !personData.cnpj)) {
      throw new Error('Informe apenas CPF ou CNPJ');
    }

    // Formatação e validação de telefone
    if (personData.phone) {
      personData.phone = this.formatPhone(personData.phone);
    }

    // Formatação e validação de CPF
    if (personData.cpf) {
      personData.cpf = this.formatCPF(personData.cpf);
      if (!this.validateCPF(personData.cpf)) {
        throw new Error('CPF inválido');
      }
    }

    // Formatação e validação de CNPJ
    if (personData.cnpj) {
      personData.cnpj = this.formatCNPJ(personData.cnpj);
      if (!this.validateCNPJ(personData.cnpj)) {
        throw new Error('CNPJ inválido');
      }
    }

    // Validação de email único
    if (personData.email) {
      const existingPerson = await Person.findOne({
        where: { email: personData.email }
      });
      if (existingPerson) {
        throw new Error('Email já cadastrado para outra pessoa');
      }
    }

    if (createdByUserUid) {
      personData.createdByUserUid = createdByUserUid;
    }

    personData.createdAt = new Date();
    personData.updatedAt = new Date();

    return await Person.create(personData);
  }

  /**
   * Atualizar pessoa com validações de negócio
   */
  static async updatePerson(uid: string, updateData: any) {
    const person = await Person.findByPk(uid);
    if (!person) {
      throw new Error('Pessoa não encontrada');
    }

    // Não permitir alterar CPF/CNPJ se já existir
    if (updateData.cpf && person.cpf && updateData.cpf !== person.cpf) {
      throw new Error('CPF não pode ser alterado após cadastro');
    }
    if (updateData.cnpj && person.cnpj && updateData.cnpj !== person.cnpj) {
      throw new Error('CNPJ não pode ser alterado após cadastro');
    }

    // Não permitir adicionar CPF se já existe CNPJ e vice-versa
    if ((updateData.cpf && person.cnpj) || (updateData.cnpj && person.cpf)) {
      throw new Error('Não é permitido adicionar CPF a quem já possui CNPJ e vice-versa');
    }

    // Formatação e validação de telefone
    if (updateData.phone) {
      updateData.phone = this.formatPhone(updateData.phone);
    }

    // Formatação e validação de CPF
    if (updateData.cpf) {
      updateData.cpf = this.formatCPF(updateData.cpf);
      if (!this.validateCPF(updateData.cpf)) {
        throw new Error('CPF inválido');
      }
    }

    // Formatação e validação de CNPJ
    if (updateData.cnpj) {
      updateData.cnpj = this.formatCNPJ(updateData.cnpj);
      if (!this.validateCNPJ(updateData.cnpj)) {
        throw new Error('CNPJ inválido');
      }
    }

    updateData.updatedAt = new Date();

    await Person.update(updateData, { where: { uid } });
    return await Person.findByPk(uid);
  }

  /**
   * Buscar pessoa com relacionamentos
   */
  static async getPersonWithRelations(uid: string) {
    const person = await Person.findByPk(uid, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['uid', 'name', 'email']
        }
      ]
    });

    if (!person) {
      throw new Error('Pessoa não encontrada');
    }

    return person;
  }

  /**
   * Listar pessoas com filtros e paginação
   */
  static async listPersons(filters: any = {}, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const whereClause: any = {};

    // Regra de negócio: Filtros inteligentes
    if (filters.name) {
      whereClause.name = { [Op.iLike]: `%${filters.name}%` };
    }

    if (filters.email) {
      whereClause.email = { [Op.iLike]: `%${filters.email}%` };
    }

    if (filters.cpf) {
      whereClause.cpf = this.formatCPF(filters.cpf);
    }

    if (filters.cnpj) {
      whereClause.cnpj = this.formatCNPJ(filters.cnpj);
    }

    const { count, rows } = await Person.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      persons: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Vincular uma pessoa como dados pessoais de um usuário (1:1)
   */
  static async linkPersonToUser(personUid: string, userUid: string) {
    const person = await Person.findByPk(personUid);
    const user = await User.findByPk(userUid);

    if (!person) {
      throw new Error('Pessoa não encontrada');
    }

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verifica se essa pessoa já está vinculada a outro usuário
    const existingUser = await User.findOne({
      where: { personUid: personUid, uid: { [Op.ne]: userUid } }
    });
    if (existingUser) {
      throw new Error('Esta pessoa já está vinculada a outro usuário');
    }

    // Atualiza o usuário para apontar para a pessoa
    await user.update({ personUid: personUid });
    return user;
  }

  /**
   * Inativar uma pessoa (define active como false)
   */
  static async inactivatePerson(uid: string): Promise<boolean> {
    const person = await Person.findByPk(uid);
    if (!person) {
      return false;
    }
    await person.update({ active: false, updatedAt: new Date() });
    return true;
  }

  /**
   * Deletar uma pessoa
   */
  static async deletePerson(uid: string): Promise<boolean> {
    const deleted = await Person.destroy({ where: { uid } });
    return deleted > 0;
  }

  // ===== MÉTODOS AUXILIARES (Regras de formatação) =====

  /**
   * Formatar telefone
   */
  private static formatPhone(phone: string): string {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    
    // Aplica máscara (XX) XXXX-XXXX
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    
    return phone; // Retorna original se não conseguir formatar
  }

  /**
   * Formatar CPF
   */
  private static formatCPF(cpf: string): string {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
    }
    return cpf;
  }

  /**
   * Formatar CNPJ
   */
  private static formatCNPJ(cnpj: string): string {
    const numbers = cnpj.replace(/\D/g, '');
    if (numbers.length === 14) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
    }
    return cnpj;
  }

  /**
   * Validação real de CPF
   */
  private static validateCPF(cpf: string): boolean {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11 || /^(\d)\1+$/.test(numbers)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(numbers.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    return rest === parseInt(numbers.substring(10, 11));
  }

  /**
   * Validação real de CNPJ
   */
  private static validateCNPJ(cnpj: string): boolean {
    const numbers = cnpj.replace(/\D/g, '');
    if (numbers.length !== 14 || /^(\d)\1+$/.test(numbers)) return false;
    let length = numbers.length - 2;
    let numbersBase = numbers.substring(0, length);
    let digits = numbers.substring(length);
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbersBase.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    length = length + 1;
    numbersBase = numbers.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbersBase.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    return result === parseInt(digits.charAt(1));
  }
}
