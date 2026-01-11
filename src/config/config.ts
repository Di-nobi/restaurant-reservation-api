import { Sequelize, SyncOptions } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

let sequelize: Sequelize;

sequelize = new Sequelize(process.env.DB_NAME as string, process.env.DB_USER as string, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: 3306
});

export function syncDB() {
    const dbSyncer: SyncOptions = {
        logging: false,
        force: false,
        alter: false
    };
    sequelize
      .sync(dbSyncer)
      .then(() => {
        console.log('DB synced')
      }).catch((err) => { console.error('Error syncing:', err)})
}

export default sequelize;