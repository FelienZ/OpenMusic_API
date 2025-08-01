const InvariantError = require('../../Exceptions/InvariantError');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');

const AuthenticationsValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const validationData = PostAuthenticationPayloadSchema.validate(payload);
    if (validationData.error) {
      throw new InvariantError(validationData.error.message);
    }
  },
  validatePutAuthenticationPayload: (payload) => {
    const validationData = PutAuthenticationPayloadSchema.validate(payload);
    if (validationData.error) {
      throw new InvariantError(validationData.error.message);
    }
  },
  validateDeleteAuthenticationPayload: (payload) => {
    const validationData = DeleteAuthenticationPayloadSchema.validate(payload);
    if (validationData.error) {
      throw new InvariantError(validationData.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;