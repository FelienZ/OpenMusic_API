const mapSongsDBToModel = ({ 
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id
});
//title, year, performer, genre, duration, albumId
module.exports = { mapSongsDBToModel };