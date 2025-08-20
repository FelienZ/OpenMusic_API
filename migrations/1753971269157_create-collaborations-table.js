<<<<<<< HEAD
exports.shorthands = undefined;

=======
/* eslint-disable camelcase */
 
exports.shorthands = undefined;
 
>>>>>>> a647355190cdd826b04931b9dc0dcfb86edd7720
exports.up = (pgm) => {
  // membuat table collaborations
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
<<<<<<< HEAD

  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');

  pgm.addConstraint('collaborations', 'fk_collaborations_playlist_id_playlists_id', 'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE');
  pgm.addConstraint('collaborations', 'fk_collaborations_user_id_users_id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

=======
 
  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
 
  pgm.addConstraint('collaborations', 'fk_collaborations_playlist_id_playlists_id', 'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE');
  pgm.addConstraint('collaborations', 'fk_collaborations_user_id_users_id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};
 
>>>>>>> a647355190cdd826b04931b9dc0dcfb86edd7720
exports.down = (pgm) => {
  // menghapus tabel collaborations
  pgm.dropTable('collaborations');
};