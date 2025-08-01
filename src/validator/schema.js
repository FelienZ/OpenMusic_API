const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required()
});

const MusicPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string()
});

module.exports = { AlbumPayloadSchema, MusicPayloadSchema };
/* title : string, required.
year : number, required.
genre : string, required.
performer : string, required.
duration : number.
albumId: string. */