const InvariantError = require('../../Exceptions/InvariantError');
const { PlaylistSongSchema } = require('./schema');

const PlaylistSongValidator = {
  validatePlaylistSongPayload: (payload) =>{
    const validationData = PlaylistSongSchema.validate(payload);
    if (validationData.error){
      throw new InvariantError(validationData.error.message);
    }
  }
};

module.exports = PlaylistSongValidator;