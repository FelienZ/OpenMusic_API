const Hapi = require('@hapi/hapi');
const albums = require('./api/album');
const AlbumValidator = require('./validator/album');
// const music = require('./music');
const AlbumsService = require('./services/postgres/AlbumServices');
const ClientError = require('./Exceptions/ClientError');
const music = require('./api/music');
const SongServices = require('./services/postgres/MusicServices');
const MusicValidator = require('./validator/song');

require('dotenv').config();
const init = async () =>{
    const albumService = new AlbumsService();
    const songServices = new SongServices();
    const server = Hapi.server({
        port:process.env.PORT,
        host: process.env.HOST,
        routes:{
            cors:{
                origin: ['*']
            }
        }
    })
    await server.register({
    plugin: albums,
    options:{
      service: albumService,
      validator: AlbumValidator
    }
  });
  await server.register({
    plugin: music,
    options:{
      service: songServices,
      validator: MusicValidator
    }
  });
  server.ext('onPreResponse', (request, h)=>{
    const { response } = request;

    if(response instanceof ClientError){
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
    return h.continue;
  })
    await server.start();
    console.log(`Server Run at ${server.info.uri}`)
}

init()