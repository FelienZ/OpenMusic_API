const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../Exceptions/InvariantError');
const NotFoundError = require('../../Exceptions/NotFoundError');

class AlbumService{
    constructor(){
        this._pool = new Pool;
    }
    async addAlbum({ name, year }){
        const generateId = nanoid(16);
        const id = `album-${generateId}`;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        }
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
        throw new InvariantError('Album gagal ditambahkan');
        }
    
        return result.rows[0].id;
    }
    async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows;
  }
  async getAlbumById(id) {
    const queryAlbum = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id],
    }
    const Albumresult = await this._pool.query(queryAlbum);
    if (!Albumresult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    const querySongs = {
    text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
    values: [id],
    };

    const Songresult = await this._pool.query(querySongs);
    const album = Albumresult.rows[0];

    return {
        id: album.id,
        name: album.name,
        year: album.year,
        songs: Songresult.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3  RETURNING id',
      values: [name, year, id],
    };
 
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }
  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumService;