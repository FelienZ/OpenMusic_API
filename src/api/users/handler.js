class UsersHandler{
  constructor(service, validator){
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }
  async postUserHandler(req, h){
    await this._validator.validateUsersPayload(req.payload);
    const { username, password, fullname } = req.payload;
    const userId = await this._service.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User Berhasil Register',
      data:{
        userId
      }
    });
    response.code(201);
    return response;
  }
}
module.exports = UsersHandler;