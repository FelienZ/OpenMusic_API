const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../Exceptions/InvariantError');
const NotFoundError = require('../../Exceptions/NotFoundError');
const AuthorizationError = require('../../Exceptions/AuthorizationError');

class PlaylistServices{
  constructor(collaborationService, songService){
    this._pool = new Pool();
    this._songService = songService;
    this._collaborationService = collaborationService;
  }
  async addPlaylist({ name, owner }){
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: ' INSERT INTO playlist (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id){
      throw new InvariantError('Playlist Gagal ditambahkan');
    }
    return result.rows[0].id;
  }
  async getPlaylists(owner){
    const query ={
      text:  `
            SELECT playlist.id, playlist.name, users.username
            FROM playlist
            LEFT JOIN collaborations ON collaborations.playlist_id = playlist.id
            JOIN users ON users.id = playlist.owner
            WHERE playlist.owner = $1 OR collaborations.user_id = $1
            GROUP BY playlist.id, users.username
            `,
      values: [owner]
    };
    // console.log('Kueri: ',query)
    const result = await this._pool.query(query);
    // console.log('Hasil Kueri: ',result.rows)
    /* if(!result.rows.length){
            throw new NotFoundError('Playlist tidak tersedia')
        } */
    return result.rows;
  }
  async verifyPlaylistOwner(id, owner){
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id]
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner){
      throw new AuthorizationError('Anda Tidak Berhak Mengakses Resource');
    }
  }
  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }
  async verifyPlaylistAccess(playlistId, userId){
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
  async addSongtoPlaylist(playlistId, songId){
    await this._songService.getSongById(songId);
    const id = `song-${nanoid(16)}`;
    const query ={
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new InvariantError('Gagal Menambahkan Lagu ke Playlist');
    }
    return result.rows[0].id;
  }
  async getListSongs(playlistId){
    const queryPlaylist ={
      text: `SELECT playlist.id, playlist.name, users.username FROM playlist
            JOIN users ON users.id = playlist.owner WHERE playlist.id = $1 `,
      values: [playlistId]
    };
    const playlistResult = await this._pool.query(queryPlaylist);
    if (!playlistResult.rows.length){
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = playlistResult.rows[0];

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
            JOIN songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId]
    };
    const songsResult = await this._pool.query(querySongs);
    return {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: songsResult.rows
    };
  }
  async deleteSonginPlaylist(playlistId, songId){
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new NotFoundError('Lagu Tidak ditemukan di playlist');
    }
  }
  async addActivitiesinPlaylist({ playlistId, songId, userId, action }){
    const id = `log-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query ={
      text: 'INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time) VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time]
    };

    await this._pool.query(query);
  }
  async getActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `
            SELECT users.username, songs.title, a.action, a.time
            FROM playlist_song_activities a
            JOIN users ON a.user_id = users.id
            JOIN songs ON a.song_id = songs.id
            WHERE a.playlist_id = $1
            ORDER BY a.time ASC`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistServices;