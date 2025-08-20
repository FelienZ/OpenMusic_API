const Joi = require('joi');

const PlaylistSongSchema = Joi.object({
  songId: Joi.string().required()
});

module.exports = { PlaylistSongSchema };