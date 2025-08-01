const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { services, validator }) => {
    const handler = new PlaylistHandler(services, validator);
    server.route(routes(handler));
  },
};