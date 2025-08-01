/* eslint-disable camelcase */
 
exports.shorthands = undefined;
 
exports.up = (pgm) => {
  // membuat user baru.
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_playlist', 'old_playlist', 'old_playlist', 'old playlist')");
 
  pgm.sql("UPDATE playlist SET owner = 'old_playlist' WHERE owner IS NULL");
 
  pgm.addConstraint('playlist', 'fk_playlist_owner_users_id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};
 
exports.down = (pgm) => {  

  pgm.dropConstraint('playlist', 'fk_playlist_owner_users_id');
 
  pgm.sql("UPDATE playlist SET owner = NULL WHERE owner = 'old_playlist'");
 
  // menghapus user baru.
  pgm.sql("DELETE FROM users WHERE id = 'old_playlist'");
};