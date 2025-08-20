const InvariantError = require('../../Exceptions/InvariantError');
const { CollaborationPayloadSchema } = require('./schema');

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const validationData = CollaborationPayloadSchema.validate(payload);

    if (validationData.error) {
      throw new InvariantError(validationData.error.message);
    }
  },
};

module.exports = CollaborationsValidator;