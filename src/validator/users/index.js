const InvariantError = require('../../Exceptions/InvariantError');
const { UsersPayloadSchema } = require('./schema');

const UserValidator = {
  validateUsersPayload: (payload) =>{
    const validationData = UsersPayloadSchema.validate(payload);

    if (validationData.error){
      throw new InvariantError(validationData.error.message);
    }
  }
};

module.exports = UserValidator;