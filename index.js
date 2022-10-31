const debug = require('debug')('systemic:redis');

module.exports = (options) => {
  let redis = (options && options.redis) || require('redis');
  let client;
  let config;
  let logger;

  const connectToRedis = async () => client.connect();

  const start = async (dependencies) => {
    debug(dependencies);
    config = { ...dependencies.config };

    if (!config) {
      throw new Error('config is required');
    }

    ({ logger } = dependencies);

    if (!logger) {
      logger = console;
    }

    // https://github.com/redis/node-redis#basic-example
    const host = config.url || config.host || '127.0.0.1';
    const database = config.db || 0;
    let protocol = 'redis://';
    const socket = {
      connectTimeout: 10000,
      keepAlive: 5000,
      reconnectStrategy: retries => {
        console.log('Reconnect attempt', retries);
        return 3000;
      }
    };
    if (config.tls) {
      protocol = 'rediss://';
      socket.tls = true;
      socket.servername = host;
    }
    const url = protocol + host + ':' + config.port + '/' + database;
    client = redis.createClient({
      url,
      password: config.password,
      socket,
    });

    client.on('connect', () => {
      logger.info(`Try connecting ${url}`);
    });

    client.on('ready', () => {
      logger.info(`Connected ${url}`);
    })

    // Without handling incoming server errors the process would get finished
    client.on("error", error => {
      console.error("client err", error);
    });

    client.on('reconnecting', () => {
      console.info(`Redis client is reconnecting to ${url}...`)
    })

    if (config.no_ready_check) {
      connectToRedis();
    } else {
      await connectToRedis();
    }

    return client;
  };

  const stop = async () => client.disconnect();

  return {
    start,
    stop,
  };
};
