exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('albums', {
    cover_url: {
      type: 'TEXT',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover_url');
};
