// ===================================================================
// CASO 1: RENOMEAR CAMPO (ex: 'name' para 'fullName')
// ===================================================================

// 1. Criar migration para renomear coluna
// migrations/001-rename-name-to-fullname.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('persons', 'name', 'fullName');
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('persons', 'fullName', 'name');
  }
};

// 2. Atualizar o modelo Person
// models/person.ts
import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../config/database';

export class Person extends Model<InferAttributes<Person>, InferCreationAttributes<Person>> {
  declare uid: string;
  declare fullName: string; // <- Campo renomeado
  declare birthDate: Date | null;
  declare document: string;
  declare email: string;
  declare phone: string | null;
  declare address: string | null;
  declare isActive: boolean;
  declare createdByUserUid: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedByUserUid: string;
  declare updatedAt: CreationOptional<Date>;
}

Person.init({
  uid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: { // <- Campo renomeado aqui também
    type: DataTypes.STRING,
    allowNull: false,
    field: 'fullName' // Mapeia para a coluna no banco
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  document: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdByUserUid: {
    type: DataTypes.UUID,
    allowNull: false
  },
  updatedByUserUid: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  sequelize,
  modelName: 'Person',
  tableName: 'persons'
});

// 3. Atualizar types
// types/person.types.ts
export interface Person {
  uid: string;
  fullName: string; // <- Atualizado aqui
  birthDate: Date | null;
  document: string;
  email: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdByUserUid: string;
  createdAt: Date;
  updatedByUserUid: string;
  updatedAt: Date;
}

export interface CreatePersonData {
  fullName: string; // <- E aqui
  // ... outros campos
}

// ===================================================================
// CASO 2: ALTERAR TIPO DE DADO (ex: phone VARCHAR(20) -> VARCHAR(50))
// ===================================================================

// 1. Migration para alterar tipo
// migrations/002-change-phone-type.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('persons', 'phone', {
      type: Sequelize.STRING(50), // Novo tamanho
      allowNull: true
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    // CUIDADO: Pode truncar dados se reverter
    await queryInterface.changeColumn('persons', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
  }
};

// 2. Para mudanças mais complexas (ex: STRING para JSON)
// migrations/003-convert-address-to-json.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criar nova coluna temporária
    await queryInterface.addColumn('persons', 'address_json', {
      type: Sequelize.JSON,
      allowNull: true
    });
    
    // Migrar dados existentes
    await queryInterface.sequelize.query(`
      UPDATE persons 
      SET address_json = JSON_OBJECT('street', address)
      WHERE address IS NOT NULL
    `);
    
    // Remover coluna antiga
    await queryInterface.removeColumn('persons', 'address');
    
    // Renomear nova coluna
    await queryInterface.renameColumn('persons', 'address_json', 'address');
  },
  
  down: async (queryInterface, Sequelize) => {
    // Reverter para string
    await queryInterface.addColumn('persons', 'address_temp', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.sequelize.query(`
      UPDATE persons 
      SET address_temp = JSON_EXTRACT(address, '$.street')
      WHERE address IS NOT NULL
    `);
    
    await queryInterface.removeColumn('persons', 'address');
    await queryInterface.renameColumn('persons', 'address_temp', 'address');
  }
};

// ===================================================================
// CASO 3: ADICIONAR CAMPO NOVO (ex: 'profilePhoto')
// ===================================================================

// 1. Migration para adicionar campo
// migrations/004-add-profile-photo.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('persons', 'profilePhoto', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'address' // Posição da coluna (MySQL)
    });
    
    // Opcionalmente, definir valor padrão para registros existentes
    await queryInterface.sequelize.query(`
      UPDATE persons 
      SET profilePhoto = 'default-avatar.png'
      WHERE profilePhoto IS NULL
    `);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('persons', 'profilePhoto');
  }
};

// 2. Atualizar modelo
Person.init({
  // ... campos existentes ...
  profilePhoto: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'default-avatar.png'
  }
  // ... resto do modelo
}, {
  // ... configurações
});

// 3. Atualizar interfaces
export interface Person {
  // ... campos existentes ...
  profilePhoto?: string | null;
}

export interface CreatePersonData {
  // ... campos existentes ...
  profilePhoto?: string | null;
}

export interface UpdatePersonData {
  // ... campos existentes ...
  profilePhoto?: string | null;
}

// ===================================================================
// SISTEMA DE MIGRATIONS PARA SEU PROJETO
// ===================================================================

// config/migrations.ts
import { QueryInterface, Sequelize } from 'sequelize';

export interface Migration {
  name: string;
  up: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>;
  down: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>;
}

// utils/migration-runner.ts
import { sequelize } from '../config/database';
import { Migration } from '../config/migrations';

export class MigrationRunner {
  private migrations: Migration[] = [];
  
  addMigration(migration: Migration) {
    this.migrations.push(migration);
  }
  
  async runMigrations() {
    const queryInterface = sequelize.getQueryInterface();
    
    // Criar tabela de controle de migrations
    await this.ensureMigrationsTable();
    
    for (const migration of this.migrations) {
      const isExecuted = await this.isMigrationExecuted(migration.name);
      
      if (!isExecuted) {
        console.log(`Executando migration: ${migration.name}`);
        
        try {
          await migration.up(queryInterface, sequelize);
          await this.markMigrationAsExecuted(migration.name);
          console.log(`Migration ${migration.name} executada com sucesso`);
        } catch (error) {
          console.error(`Erro na migration ${migration.name}:`, error);
          throw error;
        }
      }
    }
  }
  
  private async ensureMigrationsTable() {
    const queryInterface = sequelize.getQueryInterface();
    
    await queryInterface.createTable('migrations', {
      id: {
        type: 'INTEGER',
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: 'STRING',
        allowNull: false,
        unique: true
      },
      executedAt: {
        type: 'DATE',
        allowNull: false
      }
    });
  }
  
  private async isMigrationExecuted(name: string): Promise<boolean> {
    const result = await sequelize.query(
      'SELECT COUNT(*) as count FROM migrations WHERE name = ?',
      {
        replacements: [name],
        type: 'SELECT'
      }
    );
    
    return (result[0] as any).count > 0;
  }
  
  private async markMigrationAsExecuted(name: string) {
    await sequelize.query(
      'INSERT INTO migrations (name, executedAt) VALUES (?, ?)',
      {
        replacements: [name, new Date()],
        type: 'INSERT'
      }
    );
  }
}

// ===================================================================
// USO NO SEU database.ts
// ===================================================================

// config/database.ts (versão atualizada)
import { Sequelize } from 'sequelize';
import path from 'path';
import { MigrationRunner } from '../utils/migration-runner';
import { migrations } from './migrations'; // Importe suas migrations

const dbPath = path.resolve(__dirname, '../../DB.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export async function setupDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Executar migrations antes do sync
    const migrationRunner = new MigrationRunner();
    
    // Adicionar todas as migrations
    migrations.forEach(migration => {
      migrationRunner.addMigration(migration);
    });
    
    await migrationRunner.runMigrations();
    
    // Sync apenas em desenvolvimento para ajustes menores
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // alter: false para não sobrescrever migrations
    }
    
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}