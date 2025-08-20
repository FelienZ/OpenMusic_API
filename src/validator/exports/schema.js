const Joi = require('joi');
const ExportSongPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});
module.exports = ExportSongPayloadSchema;