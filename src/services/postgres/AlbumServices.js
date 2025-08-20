const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../Exceptions/InvariantError');
const NotFoundError = require('../../Exceptions/NotFoundError');

class AlbumService{
  constructor(cacheService){
    this._pool = new Pool;
    this._cacheService = cacheService;
  }
  async addAlbum({ name, year }){
    const generateId = nanoid(16);
    const id = `album-${generateId}`;

    const query = {
      text: 'INSERT INTO albums(id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
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
    };
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
      coverUrl: album.cover_url ?? null,
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
  async updateCoverUrlById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);
    // console.log('hasil: ', result.rows[0].id);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
    }
  }
  async verifyAlbumIsExists(id){
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const Albumresult = await this._pool.query(queryAlbum);
    if (!Albumresult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
  async checkAlbumLikeStatus(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }
  async likeAlbum(userId, albumId){
    const id = `albumsLike-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    };
    await this._pool.query(query);
    await this._cacheService.delete(`album-likes:${albumId}`);
  }
  async unlikeAlbum(userId, albumId){
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    await this._pool.query(query);
    await this._cacheService.delete(`album-likes:${albumId}`);
  }
  async getAlbumLikes(albumId){
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      return { likes: parseInt(result), fromCache: true };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const count = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`album-likes:${albumId}`, count, 30);

      return { likes: count, fromCache: false };
    }
  }
}

module.exports = AlbumService;