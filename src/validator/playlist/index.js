const InvariantError = require('../../Exceptions/InvariantError');
const { PlaylistSongSchema } = require('../songInPlaylist/schema');
const { PlaylistPayloadSchema } = require('./schema');

const PlaylistValidator ={
  validatePlaylistPayload: (payload) =>{
    const validationData = PlaylistPayloadSchema.validate(payload);
    if (validationData.error){
      throw new InvariantError(validationData.error.message);
    }
  },
  validatePlaylistSongPayload: (payload) => {
    const result = PlaylistSongSchema.validate(payload);
    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = PlaylistValidator;