

const { v4: uuidV4 } = require('uuid');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'usersdb'
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};


const addUser = async (username, hashedPassword) => {
  const id = uuidV4();

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [
      id,
      username,
      hashedPassword
    ]);

    connection.end();
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    throw new Error('Ocorreu um erro ao cadastrar o usuário.');
  }
};

const getUserByUsername = async (username) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
    connection.end();

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    throw new Error('Ocorreu um erro ao obter o usuário.');
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
  addUser,
  getUserByUsername
};
