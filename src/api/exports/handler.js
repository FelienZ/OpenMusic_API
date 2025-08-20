class ExportHandler{
  constructor(service, validator, playlistService){
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;
    this.postExportSongsHandler = this.postExportSongsHandler.bind(this);
  }
  async postExportSongsHandler(req, h){
    const { playlistId } = req.params;
    const { targetEmail } = req.payload;
    const { id: userId } = req.auth.credentials;
    this._validator.validateExportSongsPayload(req.payload);
    await this._playlistService.verifyPlaylistOwner(playlistId, userId);
    const message = {
      playlistId,
      targetEmail,
    };
    await this._service.sendMessage('export:playlist', JSON.stringify(message));
    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}
module.exports = ExportHandler;