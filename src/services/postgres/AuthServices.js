const { Pool } = require('pg');
const InvariantError = require('../../Exceptions/InvariantError');

class AuthServices{
  constructor(){
    this._pool = new Pool();
  }
  async addRefreshToken(token){
    const query = {
      text: 'INSERT INTO authentications (token) VALUES ($1)',
      values: [token]
    };
    await this._pool.query(query);
  }
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };
    // console.log('Kueri refresh Token: ', query )
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new InvariantError('Token Tidak Valid');
    }
    // console.log("data Token: ", result.rows[0])
  }
  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    await this._pool.query(query);
  }
}
module.exports = AuthServices;