const ClientError = require('../../Exceptions/ClientError');

class PlaylistHandler{
  constructor(service, validator){
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);

    this.getSongs = this.getSongs.bind(this);
    this.postSong = this.postSong.bind(this);
    this.deleteSong = this.deleteSong.bind(this);

    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
  }
  async postPlaylistHandler(req, h){
    try {
      this._validator.validatePlaylistPayload(req.payload);
      const { name= 'untitled' } = req.payload;

      const { id : credentialsId } = req.auth.credentials;
      const playlistId = await this._service.addPlaylist({ name, owner: credentialsId });
      const response = h.response({
        status: 'success',
        message: 'Playlist Berhasil Ditambahkan',
        data: {
          playlistId
        }
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
  async getPlaylistHandler(req) {
    const { id: credentialId } = req.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    // console.log('Playlist: ', playlist)
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }
  async deletePlaylistByIdHandler(req, h) {
    try {
      const { id } = req.params;
      const { id: credentialId } = req.auth.credentials;
      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
  async postSong(req, h){
    try {
      this._validator.validatePlaylistSongPayload(req.payload);
      const { id: playlistId } = req.params;
      const { id: credentialId } = req.auth.credentials;
      const { songId } = req.payload;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      await this._service.addSongtoPlaylist(playlistId, songId);
      await this._service.addActivitiesinPlaylist({ playlistId, songId, userId: credentialId, action: 'add' });
      return h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      }).code(201);
    } catch (error){
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
  async getSongs(req, h) {
    try {
      const { id:playlistId } = req.params;
      const { id: credentialId } = req.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const playlist = await this._service.getListSongs(playlistId);

      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
  async deleteSong(req, h){
    try {
      this._validator.validatePlaylistSongPayload(req.payload);
      const { id: playlistId } = req.params;
      const { id: credentialId } = req.auth.credentials;
      const { songId } = req.payload;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      await this._service.deleteSonginPlaylist(playlistId, songId);
      await this._service.addActivitiesinPlaylist({ playlistId, songId, userId: credentialId, action: 'delete' });
      return h.response({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      }).code(200);
    } catch (error){
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistActivitiesHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, userId);
      const activities = await this._service.getActivitiesByPlaylistId(playlistId);

      return h.response({
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      }).code(200);
    } catch (error) {
      console.error(error);
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }
  }


}
module.exports = PlaylistHandler;