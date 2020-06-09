module.exports = (options) => {
  let redis = (options && options.redis) || require('redis');
  let client;
  let config;
  let logger;

  const connectToRedis = () =>
    new Promise((resolve) => {
      client.on('ready', () => {
        logger.info(`Connection to redis reached ready state.`);
        resolve();
      });
    });

  const closeRedisConnection = () =>
    new Promise((resolve, reject) => {
      if (!client) {
        reject(new Error('Client has not been initialized.'));
        return;
      }

      logger.info(`Disconnecting from ${config.url || config.host || '127.0.0.1'}`);
      client.quit(() => {
        resolve();
      });
    });

  const start = async (dependencies) => {
    config = { ...dependencies.config };

    if (!config) {
      throw new Error('config is required');
    }

  ({ logger } = dependencies);
    if (!logger) {
      logger = console;
      // logger.info = console.log;
    }

    logger.info(`Connecting to ${config.url || config.host || '127.0.0.1'}`);
    client = redis.createClient(config);

    if (config.no_ready_check) {
      connectToRedis();
    } else {
      await connectToRedis();
    }

    return client;
  };

  const stop = async () => {
    await closeRedisConnection();
  };

  return {
    start,
    stop,
  };
};
