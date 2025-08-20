const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../Exceptions/InvariantError');
const bcrypt = require('bcrypt');
const NotFoundError = require('../../Exceptions/NotFoundError');
const AuthenticationError = require('../../Exceptions/AuthenticationError');
class UsersServices{
  constructor(){
    this._pool = new Pool();
  }
  async addUser({ username, password, fullname }){
    await this.verifyNewUsername(username);
    const id = `user-${nanoid(16)}`;
    const secretPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, secretPassword, fullname]
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new InvariantError('User gagal ditambahkan');
    }
    return result.rows[0].id;
  }
  async verifyNewUsername(username){
    const query = {
      text: 'SELECT FROM users WHERE username = $1',
      values: [username]
    };

    const result = await this._pool.query(query);
    if (result.rows.length > 0){
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }
  async getUserById(id){
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [id]
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new NotFoundError(`User dengan id: ${id} tidak ditemukan`);
    }
    return result.rows[0];
  }
  async verifyUserCredentials(username, password){
    const query = {
      text: 'SELECT id, username, password FROM users WHERE username = $1',
      values: [username]
    };
    // console.log('Verify User: ', query)
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new AuthenticationError('Kredensial Invalid');
    }
    const { id, password: secretPassword } = result.rows[0];
    // console.log("data: ", result.rows[0])
    const validatePassword = await bcrypt.compare(password, secretPassword);
    if (!validatePassword){
      throw new AuthenticationError('Kredensial Invalid - Password Salah');
    }
    // console.log('Hasil compare: ', validatePassword)
    return id;
  }
}

module.exports = UsersServices;