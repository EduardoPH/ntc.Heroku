import initdb from './models/init-models.js'
import Sequelize from 'sequelize';
import mysql2 from 'mysql2'
const sequelize = new Sequelize(
'mysql_17753_nsftcc',
'nsftcc',
'nsf@tcc', {
host: 'my01.winhost.com',
dialect: 'mysql',
logging: false,
dialectModule: mysql2
});
const db = initdb(sequelize);

export default db;