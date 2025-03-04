import { Sequelize } from 'sequelize-typescript';
import { env } from './env.config';
import { logger } from '../utils/logger';
import path from 'path';


// Create a new Sequelize instance using PostgreSQL connection parameters
export const sequelize = new Sequelize({
  database: env.database.name,
  username: env.database.user,
  password: env.database.pass,
  host: env.database.host,
  port: env.database.port,
  dialect: 'postgres',

  models: [path.join(__dirname, '../models/**/!(*index).ts')],

  //logging: (msg) => logger.debug(msg), // Enable logging for debugging
  pool: {
    max: 10, // Maximum number of connections in pool
    min: 1, // Minimum number of connections in pool
    acquire: 30000, // Maximum time (ms) a connection can be taken from pool before throwing error
    idle: 10000, // Maximum time (ms) a connection can be idle before being released
  },
  define: {
    timestamps: true, // Automatically add timestamps to models
    // underscored: true, // Use snake_case column names
  },
});

// Test the database connection
sequelize.authenticate()
  .then(() => logger.info('Database connection established successfully.'))
  .catch((error) => logger.error('Unable to connect to the database:', error));
