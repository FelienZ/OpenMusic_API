const InvariantError = require('../../Exceptions/InvariantError');
const ExportSongPayloadSchema = require('./schema');
const ExportsValidator = {
  validateExportSongsPayload: (payload) => {
    const validationResult = ExportSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;