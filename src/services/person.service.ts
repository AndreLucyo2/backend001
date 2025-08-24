import { IPersonRepository } from '../interfaces/IPersonRepository';
import {
  Person,
  CreatePersonData,
  UpdatePersonData,
  PersonResponse,
  SearchPersonParams,
  PersonSearchResult
} from '../types/person.types';
import {
  formatPhone,
  formatCPF,
  formatCNPJ,
  validateCPF,
  validateCNPJ
} from '../utils/utilis';

export class PersonService {

  private personRepository: IPersonRepository;

  constructor(personRepository: IPersonRepository) {
    this.personRepository = personRepository;
  }

  /**
 * Criar uma nova pessoa com validações de negócio
 * e registrar quem fez o cadastro (createdByUserUid)
 */
  async createPerson(personData: CreatePersonData, createdByUserUid: string): Promise<PersonResponse> {

    // Regra de negócio: quando CPF ou CNPJ for obrigatório
    if (!personData.document) {
      throw new Error('Informe um documento (CPF ou CNPJ).');
    }

    // Validar CPF/cnpj e formato se informado
    if (personData.document) {

      // Validar CPF / CNPJ único por cadastro
      const existingPerson = await this.personRepository.findByDocument(personData.document!);
      if (existingPerson) {
        throw new Error('Documento already registered (cpf/cnpj)');
      }

      if (personData.document.length === 11) {
        // Formatação e validação de CPF
        personData.document = formatCPF(personData.document);
        if (!validateCPF(personData.document)) {
          throw new Error('CPF inválido');
        }
      }
      else if (personData.document.length === 14) {
        // Formatação e validação de CNPJ
        personData.document = formatCNPJ(personData.document);
        if (!validateCNPJ(personData.document)) {
          throw new Error('CNPJ inválido');
        }

      } else {
        throw new Error('Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)');
      }
    }

    // Formatação e validação de telefone
    if (personData.phone) {
      personData.phone = formatPhone(personData.phone);
    }

    //Validação caso for email único
    if (personData.email) {
      const existingPerson = await this.personRepository.findByEmail(personData.email!);
      if (existingPerson) {
        throw new Error('Email já cadastrado para outra pessoa');
      }
    }

    //Registra quem criou a pessoa
    if (createdByUserUid) {
      personData.createdByUserUid = createdByUserUid;
    }

    // Define timestamps
    personData.createdAt = new Date();
    personData.updatedAt = new Date();

    const person = await this.personRepository.create(personData as any);
    return this.mapToResponse(person);

  }

  async getPersonByUid(uid: string): Promise<PersonResponse> {
    const person = await this.personRepository.findByUid(uid);
    if (!person) {
      throw new Error('Person not found');
    }
    return this.mapToResponse(person);
  }

  async updatePerson(uid: string, updateData: UpdatePersonData, updatedByUserUid: string): Promise<PersonResponse> {
    // Verificar se existe
    const person = await this.getPersonByUid(uid);
    if (!person) {
      throw new Error('Person not found');
    }

    // Verificar CPF único se estiver sendo alterado
    if (updateData.document) {

      // Validar CPF / CNPJ único por cadastro
      const existingPerson = await this.personRepository.findByDocument(updateData.document);
      if (existingPerson && existingPerson.uid !== uid) {
        throw new Error('Documento already registered (cpf/cnpj)');
      }

      // Validar CPF/cnpj e formato se informado
      if (updateData.document) {
        if (updateData.document.length === 11) {
          // Formatação e validação de CPF
          updateData.document = formatCPF(updateData.document);
          if (!validateCPF(updateData.document)) {
            throw new Error('CPF inválido');
          }
        }
        else if (updateData.document.length === 14) {
          // Formatação e validação de CNPJ
          updateData.document = formatCNPJ(updateData.document);
          if (!validateCNPJ(updateData.document)) {
            throw new Error('CNPJ inválido');
          }

        } else {
          throw new Error('Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)');
        }
      }

    }

    // Formatação e validação de telefone
    if (updateData.phone) {
      updateData.phone = formatPhone(updateData.phone);
    }

    // Registra quem fez a última alteração
    if (updatedByUserUid) {
      updateData.updatedByUserUid = updatedByUserUid;
    }

    updateData.updatedAt = new Date();

    const updatedPerson = await this.personRepository.update(uid, updateData);
    return this.mapToResponse(updatedPerson);
  }

  /**
 * Deletar uma pessoa
 */
  async deletePerson(uid: string): Promise<boolean> {
    const deleted = await this.personRepository.delete(uid);
    return true;
  }

  async deactivatePerson(uid: string, updatedByUserUid: string): Promise<boolean> {
    // Verificar se pessoa existe
    const user = await this.personRepository.findByUid(uid);
    if (!user) {
      throw new Error('Person not found');
    }

    const updateData: UpdatePersonData = {
      isActive: false,
      updatedByUserUid: updatedByUserUid,
      updatedAt: new Date()
    };

    await this.personRepository.update(uid, updateData);
    return true;
  }

  async activatePerson(uid: string, updatedByUserUid: string): Promise<boolean> {
    // Verificar se pessoa existe
    const user = await this.personRepository.findByUid(uid);
    if (!user) {
      throw new Error('Person not found');
    }

    const updateData: UpdatePersonData = {
      isActive: true,
      updatedByUserUid: updatedByUserUid,
      updatedAt: new Date()
    };

    await this.personRepository.update(uid, updateData);
    return true;

  }

  async listPersons(): Promise<PersonResponse[]> {
    return await this.personRepository.findAllPublic();
  }

  async searchPersons(params: SearchPersonParams): Promise<PersonSearchResult> {
    try {
      // Validações básicas
      if (params.page && params.page < 1) {
        throw new Error('Página deve ser maior que 0');
      }

      if (params.limit && (params.limit < 1 || params.limit > 100)) {
        throw new Error('Limite deve estar entre 1 e 100');
      }

      // Validar orderBy
      const validOrderFields = ['firstName', 'lastName', 'document', 'email', 'phone'];
      if (params.orderBy && !validOrderFields.includes(params.orderBy)) {
        throw new Error('Campo de ordenação inválido. Use: firstName, lastName, document, email ou phone');
      }

      // Validar orderDirection
      if (params.orderDirection && !['ASC', 'DESC'].includes(params.orderDirection)) {
        throw new Error('Direção de ordenação inválida. Use: ASC ou DESC');
      }

      // Chamar repository
      const result = await this.personRepository.searchPersons(params);

      return result;
    } catch (error) {
      throw new Error(`Erro no service ao buscar pessoas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private mapToResponse(person: any): PersonResponse {
    return {
      uid: person.uid,
      name: person.name,
      birthDate: person.birthDate,
      address: person.address,
      isActive: person.isActive,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt
    };
  }

}

// import { Person } from '../models/person';
// import { User } from '../models/user';
// import { Op } from 'sequelize';
// import {
//   formatPhone,
//   formatCPF,
//   formatCNPJ,
//   validateCPF,
//   validateCNPJ
// } from '../utils/utilis';

// export class PersonService {



//   /**
//    * Buscar pessoa com relacionamentos
//    */
//   static async getPersonWithRelations(uid: string) {
//     const person = await Person.findByPk(uid, {
//       include: [
//         {
//           model: User,
//           as: 'user',
//           attributes: ['uid', 'name', 'email']
//         }
//       ]
//     });

//     if (!person) {
//       throw new Error('Pessoa não encontrada');
//     }

//     return person;
//   }



//   /**
//    * Vincular uma pessoa com um usuário (1:1) - dados pessoais do usuário
//    */
//   static async linkPersonToUser(personUid: string, userUid: string) {
//     const person = await Person.findByPk(personUid);
//     const user = await User.findByPk(userUid);

//     if (!person) {
//       throw new Error('Pessoa não encontrada');
//     }

//     if (!user) {
//       throw new Error('Usuário não encontrado');
//     }

//     // Verifica se essa pessoa já está vinculada a outro usuário
//     const existingUser = await User.findOne({
//       where: { personUid: personUid, uid: { [Op.ne]: userUid } }
//     });
//     if (existingUser) {
//       throw new Error('Esta pessoa já está vinculada a outro usuário');
//     }

//     // Atualiza o usuário para apontar para a pessoa
//     await user.update({ personUid: personUid });
//     return user;
//   }

//   /**
//    * Inativar uma pessoa (define active como false)
//    */
//   static async inactivatePerson(uid: string): Promise<boolean> {
//     const person = await Person.findByPk(uid);
//     if (!person) {
//       return false;
//     }
//     await person.update({ active: false, updatedAt: new Date() });
//     return true;
//   }


// }
