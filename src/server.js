const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');

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

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitMQ/ProducerService');
const ExportsValidator = require('./validator/exports');

const inert = require('@hapi/inert');
const StorageService = require('./services/storage/StorageService');

const CacheService = require('./services/redis/CacheService');

require('dotenv').config();
const init = async () =>{
  const cacheService = new CacheService();
  const usersServices = new UsersServices();
  const collaborationServices = new CollaborationServices(usersServices);
  const albumService = new AlbumsService(cacheService);
  const songServices = new SongServices();
  const authServices = new AuthServices();
  const playlistServices = new PlaylistServices(collaborationServices, songServices);
  const storageService = new StorageService(path.resolve(__dirname, 'api/album/file/images'));

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
    {
      plugin: inert,
    }
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
        validator: AlbumValidator,
        storageService
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
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistService: playlistServices
      },
    },
  ]);
  //route get static file
  server.route(
    {
      method: 'GET',
      path: '/album/covers/{param*}',
      handler: {
        directory: {
          path: path.resolve(__dirname, 'api/album/file/images'),
        },
      },
    },
  );
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