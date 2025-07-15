const InvariantError = require("../../Exceptions/InvariantError");
const { AlbumPayloadSchema } = require("./schema");

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

// const MusicValidator = {
//   validateMusicPayload: (payload) => {
//     const validationResult = MusicPayloadSchema.validate(payload);
//     if (validationResult.error) {
//       throw new InvariantError(validationResult.error.message);
//     }
//   },
// };

module.exports = AlbumsValidator;