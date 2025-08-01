const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const albums = require('./api/album');
const AlbumValidator = require('./validator/album');
// const music = require('./music');
const AlbumsService = require('./services/postgres/AlbumServices');
const ClientError = require('./Exceptions/ClientError');

const music = require('./api/music');
const SongServices = require('./services/postgres/MusicServices');
const MusicValidator = require('./validator/song');

const UsersServices = require('./services/postgres/UsersServices');
const users = require('./api/users');
const UserValidator = require('./validator/users');

const AuthServices = require('./services/postgres/AuthServices');
const auth = require('./api/auth');
const tokenManager = require('./tokenize/tokenManager');
const AuthenticationsValidator = require('./validator/authentication');

const PlaylistServices = require('./services/postgres/PlaylistServices');
const playlists = require('./api/playlist');
const PlaylistValidator = require('./validator/playlist');

const collaborations = require('./api/collaboration');
const CollaborationsValidator = require('./validator/collaboration');
const CollaborationServices = require('./services/postgres/CollaborationServices');

require('dotenv').config();
const init = async () =>{
  const usersServices = new UsersServices();
  const collaborationServices = new CollaborationServices(usersServices);
  const albumService = new AlbumsService();
  const songServices = new SongServices();
  const authServices = new AuthServices();
  const playlistServices = new PlaylistServices(collaborationServices, songServices);
  const server = Hapi.server({
    port:process.env.PORT,
    host: process.env.HOST,
    routes:{
      cors:{
        origin: ['*']
      }
    }
  });
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options:{
        service: albumService,
        validator: AlbumValidator
      }
    },
    {
      plugin: music,
      options:{
        service: songServices,
        validator: MusicValidator
      }
    },
    {
      plugin: users,
      options:{
        service: usersServices,
        validator: UserValidator
      }
    },
    {
      plugin: auth,
      options: {
        authenticationsService: authServices,
        usersService: usersServices,
        tokenManager: tokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin: playlists,
      options: {
        services: playlistServices,
        validator: PlaylistValidator,
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService: collaborationServices,
        playlistsService: playlistServices,
        validator: CollaborationsValidator,
      },
    },
  ]);
  server.ext('onPreResponse', (request, h)=>{
    const { response } = request;

    if (response instanceof ClientError){
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    return h.continue;
  });
  await server.start();
  console.log(`Server Run at ${server.info.uri}`);
};

init();