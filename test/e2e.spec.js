jest.setTimeout(10000);
const systemImage = require('./system');
const redisSystem = require('../index');
const dockerCompose = require('docker-compose');

describe('systemic-redis', () => {
  const system = systemImage();

  describe('should fail', () => {
    it('wrong password', async () => {
      system.set('config', { host: 'localhost', port: 6379, password: 'wrong' });
      system.set('redis', redisSystem()).dependsOn('config');
      try {
        await system.start();
        throw new Error('This line should not be executed never');
      } catch (error) {
        expect(error.message).toBe('Unhandled error. ([ErrorReply: ERR Client sent AUTH, but no password is set])');
      }
    });
  });

  describe('should not fail', () => {
    afterEach(async () => system.stop());

    describe('redis instance connect', () => {
      it('defaults', async () => {
        system.set('config', { host: 'localhost', port: 6379 });
        system.set('redis', redisSystem()).dependsOn('config');
        const { redis: instance } = await system.start();

        expect(await instance.ping()).toBe('PONG');
        expect((await instance.sendCommand(['CLIENT', 'LIST'])).indexOf('db=0')).not.toBe(-1);
        expect((await instance.sendCommand(['CLIENT', 'LIST'])).indexOf('db=1')).toBe(-1);
      });

      it('custom host, passowrd, port and database', async () => {
        system.set('config', { host: 'localhost', password: 'systemic-redis-custom-secret', port: 6380, db: 1 });
        system.set('redis', redisSystem()).dependsOn('config');
        const { redis: instance } = await system.start();

        expect(await instance.ping()).toBe('PONG');
        expect((await instance.sendCommand(['CLIENT', 'LIST'])).indexOf('db=1')).not.toBe(-1);
        expect((await instance.sendCommand(['CLIENT', 'LIST'])).indexOf('db=0')).toBe(-1);
      });
    });

    it('reconnect strategy', async () => {
      system.set('config', { host: 'localhost', port: 6379 });
      system.set('redis', redisSystem()).dependsOn('config');
      const { redis: instance } = await system.start();

      expect(await instance.set('test', 'jest')).toBe('OK');
      expect(await instance.get('test')).toBe('jest');
      // Shutting down both redis servers for disconnecting clients
      await dockerCompose.down();

      // Not needed to wait until the redis container is up
      dockerCompose.upAll();
      // That would mean redis server has been restarted and client instance reconnected successfully
      expect(await instance.get('test')).toBe(null);
    });
  });
});
