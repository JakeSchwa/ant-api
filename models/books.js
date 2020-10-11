const { Sequelize, DataTypes } = require('sequelize');
 
const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
  },
);

const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('********************************************** \
                \nDB connection has been established successfully. \
                \n**********************************************');
  } catch (error) {
    console.error('********************************************** \
                    \nUnable to connect to the database:', error,
                    '\n**********************************************');
  }
};

testDatabaseConnection();

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
});

const models = {
  Book: sequelize.models.Book
};
 
exports.models = models;
exports.sequelize = sequelize;