var async = require('async')
var get = require('lodash.get')
var format = require('util').format

module.exports = function(options) {

    var redis = options && options.redis || require('redis')
    var client
    var config
    var logger

    function init(dependencies, cb) {
        config = dependencies.config
        logger = dependencies.logger || console
        cb()
    }

    function validate(cb) {
        if (!config) return cb(new Error('config is required'))
        cb()
    }

    function start(cb) {
        logger.info(format('Connecting to %s', config.url || config.host || '127.0.0.1'))
        client = redis.createClient(config)
        if (get(config, 'no_ready_check')) return cb(null, client)
        client.on('ready', function() {
            cb(null, client)
        })
    }

    function stop(cb) {
        if (!client) return cb()
        logger.info(format('Disconnecting from %s', config.url || config.host || '127.0.0.1'))
        client.quit(cb)
    }

    return {
        start: async.seq(init, validate, start),
        stop: stop
    }
}