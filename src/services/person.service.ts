import { Person } from '../models/person';
import { User } from '../models/user';
import { Op } from 'sequelize';
import {
  formatPhone,
  formatCPF,
  formatCNPJ,
  validateCPF,
  validateCNPJ
} from '../utils/utilis';

export class PersonService {
  /**
   * Criar uma nova pessoa com validações de negócio
   * e registrar quem fez o cadastro (createdByUserUid)
   */
  static async createPerson(personData: any, createdByUserUid?: string) {

    // Regra de negócio: nunca ambos 
    if ((personData.cpf && personData.cnpj)) {
      throw new Error('Informe apenas CPF ou CNPJ');
    }

    // Regra de negócio: Deve ter CPF ou CNPJ,
    if (!personData.cpf && !personData.cnpj) {      
      throw new Error('Informe um documento (CPF ou CNPJ).');
    }

    // Formatação e validação de CPF
    if (personData.cpf) {
      personData.cpf = formatCPF(personData.cpf);
      if (!validateCPF(personData.cpf)) {
        throw new Error('CPF inválido');
      }
    }

    // Formatação e validação de CNPJ
    if (personData.cnpj) {
      personData.cnpj = formatCNPJ(personData.cnpj);
      if (!validateCNPJ(personData.cnpj)) {
        throw new Error('CNPJ inválido');
      }
    }

    // Validação de CPF ou CNPF único
    if (personData.cnpj || personData.cpf) {
      const existingCnpj = await Person.findOne({
        where: { cnpj: personData.cnpj }
      });
      if (existingCnpj && existingCnpj.uid !== personData.uid) {
        throw new Error('CNPJ já cadastrado para outra pessoa');
      }

      const existingCpf = await Person.findOne({
        where: { cpf: personData.cpf }
      });
      if (existingCpf && existingCpf.uid !== personData.uid) {
        throw new Error('CPF já cadastrado para outra pessoa');
      }

      // Formatação e validação de telefone
      if (personData.phone) {
        personData.phone = formatPhone(personData.phone);
      }

    }

    // Validação de email único
    // if (personData.email) {
    //   const existingPerson = await Person.findOne({
    //     where: { email: personData.email }
    //   });
    //   if (existingPerson) {
    //     throw new Error('Email já cadastrado para outra pessoa');
    //   }
    // }

    //Registra quem criou a pessoa
    if (createdByUserUid) {
      personData.createdByUserUid = createdByUserUid;
    }

    // Define timestamps
    personData.createdAt = new Date();
    personData.updatedAt = new Date();

    return await Person.create(personData);
  }

  /**
   * Atualizar pessoa com validações de negócio
   */
  static async updatePerson(uid: string, updateData: any, updatedByUserUid?: string) {
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
      updateData.phone = formatPhone(updateData.phone);
    }

    // Formatação e validação de CPF
    if (updateData.cpf) {
      updateData.cpf = formatCPF(updateData.cpf);
      if (!validateCPF(updateData.cpf)) {
        throw new Error('CPF inválido');
      }
    }

    // Formatação e validação de CNPJ
    if (updateData.cnpj) {
      updateData.cnpj = formatCNPJ(updateData.cnpj);
      if (!validateCNPJ(updateData.cnpj)) {
        throw new Error('CNPJ inválido');
      }
    }

    updateData.updatedAt = new Date();

    // Registra quem fez a última alteração
    if (updatedByUserUid) {
      updateData.updatedByUserUid = updatedByUserUid;
    }

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
      whereClause.cpf = formatCPF(filters.cpf);
    }

    if (filters.cnpj) {
      whereClause.cnpj = formatCNPJ(filters.cnpj);
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
   * Vincular uma pessoa com um usuário (1:1) - dados pessoais do usuário
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
}
