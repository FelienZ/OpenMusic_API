const ClientError = require('../../Exceptions/ClientError');

class AlbumHandler{
  constructor(service, validator, storageService){
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);

    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    this.postAlbumLikesHandler = this.postAlbumLikesHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
    this.deleteAlbumLikesHandler = this.deleteAlbumLikesHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const response =  h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
  async postAlbumCoverHandler(request, h){
    const { cover } = request.payload;
    const { id } = request.params;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/album/covers/${filename}`;
    await this._service.updateCoverUrlById(id, fileLocation);
    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      data: {
        coverUrl: fileLocation,
      },
    });
    response.code(201);
    return response;
  }
  async postAlbumLikesHandler(request, h){
    const { id:albumId } = request.params;
    const { id:userId } = request.auth.credentials;
    //verifikasi album
    await this._service.verifyAlbumIsExists(albumId);
    const albumIsLiked = await this._service.checkAlbumLikeStatus(userId, albumId);
    if (albumIsLiked) {
      throw new ClientError('Album Sudah DiLike!');
    };
    await this._service.likeAlbum(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil Menambahkan Like!',
    });
    response.code(201);
    return response;
  }
  async getAlbumLikesHandler(request, h){
    const { id:albumId } = request.params;
    //verifikasi album
    await this._service.verifyAlbumIsExists(albumId);
    const { likes, fromCache } = await this._service.getAlbumLikes(albumId);
    const response = h.response({
      status: 'success',
      data: {
        likes,
      }
    });
    response.code(200);
    if (fromCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
  async deleteAlbumLikesHandler(request, h){
    const { id:albumId } = request.params;
    const { id:userId } = request.auth.credentials;
    //verifikasi album
    await this._service.verifyAlbumIsExists(albumId);
    await this._service.unlikeAlbum(userId, albumId);
    const response = h.response({
      status: 'success',
      message: 'Berhasil Menghapus Like!',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumHandler;