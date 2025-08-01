class AuthenticationHandler{
  constructor(authenticationsService, usersService, tokenManager, validator){
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }
  async postAuthenticationHandler(req, h){
    this._validator.validatePostAuthenticationPayload(req.payload);
    const { username, password } = req.payload;

    const id = await this._usersService.verifyUserCredentials(username, password);
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });
    // console.log("refresh: ", refreshToken)
    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Autentikasi berhasil ditambahkan',
      data: {
        accessToken, refreshToken
      }
    });
    response.code(201);
    return response;
  }
  async putAuthenticationHandler(req){
    this._validator.validatePutAuthenticationPayload(req.payload);

    const { refreshToken } = req.payload;

    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    return {
      status: 'success',
      message: 'Access Token berhasil diupdate',
      data: {
        accessToken
      }
    };
  }

  async deleteAuthenticationHandler(req){
    await this._validator.validateDeleteAuthenticationPayload(req.payload);

    const { refreshToken } = req.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus'
    };
  }
}
module.exports = AuthenticationHandler;