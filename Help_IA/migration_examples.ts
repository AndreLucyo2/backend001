// ==================================================
// CASO 1: RENOMEAR CAMPO (name -> fullName)
// ==================================================

// 1.1 - Migration para renomear coluna
import { QueryInterface, DataTypes } from 'sequelize';

export const renameName = {
  up: async (queryInterface: QueryInterface) => {
    // Renomear coluna 'name' para 'fullName'
    await queryInterface.renameColumn('persons', 'name', 'fullName');
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter mudança
    await queryInterface.renameColumn('persons', 'fullName', 'name');
  }
};

// 1.2 - Atualizar Model
export class Person extends Model {
  public uid!: string;
  public fullName!: string; // Campo renomeado
  public phone!: string;
  public email!: string;
  public document!: string;
  public observation!: string;
  public isActive!: boolean;
  public createdByUserUid!: string;
  public readonly createdAt!: Date;
  public updatedByUserUid!: string;
  public readonly updatedAt!: Date;
}

Person.init({
  uid: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4().toUpperCase(),
    primaryKey: true,
  },
  fullName: { // Campo atualizado
    type: DataTypes.STRING,
    allowNull: false,
  },
  // ... outros campos
}, {
  sequelize,
  tableName: 'persons',
});

// 1.3 - Atualizar Types
export interface Person {
  uid: string;
  fullName: string; // Atualizar tipo
  // ... outros campos
}

export interface CreatePersonData {
  fullName: string; // Atualizar tipo
  // ... outros campos
}

// ==================================================
// CASO 2: ALTERAR TIPO DE DADO (phone: STRING -> TEXT)
// ==================================================

// 2.1 - Migration para alterar tipo de coluna
export const changePhoneType = {
  up: async (queryInterface: QueryInterface) => {
    // Alterar tipo da coluna 'phone' de STRING para TEXT
    await queryInterface.changeColumn('persons', 'phone', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter para STRING
    await queryInterface.changeColumn('persons', 'phone', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  }
};

// 2.2 - Atualizar Model
Person.init({
  // ... outros campos
  phone: {
    type: DataTypes.TEXT, // Tipo alterado
    allowNull: true,
  },
  // ... outros campos
}, {
  sequelize,
  tableName: 'persons',
});

// ==================================================
// CASO 3: ADICIONAR NOVO CAMPO
// ==================================================

// 3.1 - Migration para adicionar coluna
export const addBirthDateField = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar nova coluna 'birthDate'
    await queryInterface.addColumn('persons', 'birthDate', {
      type: DataTypes.DATE,
      allowNull: true,
    });
    
    // Adicionar nova coluna 'address'
    await queryInterface.addColumn('persons', 'address', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover colunas adicionadas
    await queryInterface.removeColumn('persons', 'birthDate');
    await queryInterface.removeColumn('persons', 'address');
  }
};

// 3.2 - Atualizar Model
export class Person extends Model {
  public uid!: string;
  public name!: string;
  public phone!: string;
  public email!: string;
  public document!: string;
  public observation!: string;
  public birthDate!: Date; // NOVO CAMPO
  public address!: string; // NOVO CAMPO
  public isActive!: boolean;
  public createdByUserUid!: string;
  public readonly createdAt!: Date;
  public updatedByUserUid!: string;
  public readonly updatedAt!: Date;
}

Person.init({
  uid: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4().toUpperCase(),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  document: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  observation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  birthDate: { // NOVO CAMPO
    type: DataTypes.DATE,
    allowNull: true,
  },
  address: { // NOVO CAMPO
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  createdByUserUid: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'uid' }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedByUserUid: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'uid' }
  },
}, {
  sequelize,
  tableName: 'persons',
});

// 3.3 - Atualizar Types
export interface Person {
  uid: string;
  name: string;
  birthDate: Date | null; // NOVO CAMPO
  document: string;
  email: string;
  phone: string | null;
  address: string | null; // NOVO CAMPO
  isActive: boolean;
  createdByUserUid: string;
  createdAt: Date;
  updatedByUserUid: string;
  updatedAt: Date;
}

export interface CreatePersonData {
  name: string;
  birthDate?: Date | null; // NOVO CAMPO
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null; // NOVO CAMPO
  isActive: boolean | true;
  createdByUserUid: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePersonData {
  name?: string;
  birthDate?: Date | null; // NOVO CAMPO
  document?: string;
  phone?: string | null;
  address?: string | null; // NOVO CAMPO
  isActive?: boolean | true;
  updatedByUserUid: string | null;
  updatedAt: Date;
}

// ==================================================
// SISTEMA DE MIGRAÇÕES COMPLETO
// ==================================================

// migrations/runner.ts
import { QueryInterface, Sequelize } from 'sequelize';
import { sequelize } from '../config/database';

interface Migration {
  up: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>;
  down: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>;
}

class MigrationRunner {
  private migrations: { [key: string]: Migration } = {
    '001_rename_name_to_fullName': renameName,
    '002_change_phone_type': changePhoneType,
    '003_add_new_fields': addBirthDateField,
  };

  async runMigration(migrationName: string): Promise<void> {
    const migration = this.migrations[migrationName];
    if (!migration) {
      throw new Error(`Migration ${migrationName} not found`);
    }

    try {
      console.log(`Running migration: ${migrationName}`);
      await migration.up(sequelize.getQueryInterface(), sequelize);
      console.log(`Migration ${migrationName} completed successfully`);
    } catch (error) {
      console.error(`Migration ${migrationName} failed:`, error);
      throw error;
    }
  }

  async rollbackMigration(migrationName: string): Promise<void> {
    const migration = this.migrations[migrationName];
    if (!migration) {
      throw new Error(`Migration ${migrationName} not found`);
    }

    try {
      console.log(`Rolling back migration: ${migrationName}`);
      await migration.down(sequelize.getQueryInterface(), sequelize);
      console.log(`Rollback ${migrationName} completed successfully`);
    } catch (error) {
      console.error(`Rollback ${migrationName} failed:`, error);
      throw error;
    }
  }
}

export const migrationRunner = new MigrationRunner();

// ==================================================
// SCRIPT DE EXECUÇÃO DAS MIGRAÇÕES
// ==================================================

// scripts/run-migrations.ts
import { migrationRunner } from '../migrations/runner';
import { setupDatabase } from '../config/database';

async function main() {
  try {
    // Conectar ao banco
    await setupDatabase();

    // Executar migrações
    // await migrationRunner.runMigration('001_rename_name_to_fullName');
    // await migrationRunner.runMigration('002_change_phone_type');
    await migrationRunner.runMigration('003_add_new_fields');

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();