module.exports = (options) => {
  let redis = (options && options.redis) || require('redis');
  let client;
  let config;
  let logger;

  const connectToRedis = () => client.connect();

  const start = async (dependencies) => {
    config = { ...dependencies.config };

    if (!config) {
      throw new Error('config is required');
    }

    const { keepAlive, keepAliveTimer: keepAliveTimerParam } = config;
    if (keepAliveTimerParam && (isNaN(keepAliveTimerParam) || keepAliveTimerParam <= 0)) {
      throw new Error(`${keepAliveTimerParam} is not a valid number.`);
    }
    // 30 seconds by default
    const keepAliveTimer = keepAliveTimerParam ? keepAliveTimerParam * 1000 : 30000;

    ({ logger } = dependencies);

    if (!logger) {
      logger = console;
    }

    logger.info(`Connecting to ${config.url || config.host || '127.0.0.1'}`);
    client = redis.createClient(config);

    if (config.no_ready_check) {
      connectToRedis();
    } else {
      await connectToRedis();
    }

    /**
     * Redis instances in Azure disconnect the client after an IDLE time causing a forced reconnection.
     * https://gist.github.com/JonCole/925630df72be1351b21440625ff2671f#file-redis-bestpractices-node-js-md
     */
    keepAlive && setInterval(() => {
      client.ping();
    }, keepAliveTimer);

    return client;
  };

  const stop = async () => client.disconnect();

  return {
    start,
    stop,
  };
};
