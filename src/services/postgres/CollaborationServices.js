const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../Exceptions/InvariantError');

class CollaborationServices{
  constructor(usersServices){
    this._pool = new Pool();
    this._usersServices = usersServices;
  }
  async addCollaboration(playlistId, userId) {
    await this._usersServices.getUserById(userId);
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new InvariantError('Gagal membuat kolaborasi');
    }
    return result.rows[0].id;
  }
  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new InvariantError('Gagal menghapus kolaborasi');
    }
  }
  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationServices;