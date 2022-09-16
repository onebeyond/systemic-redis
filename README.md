# systemic-redis

A [systemic](https://github.com/guidesmiths/systemic) redis component

## ⚠️ Important notice

Upgrading from version [2.0.1](https://github.com/guidesmiths/systemic-redis/releases/tag/v2.0.1) to versions [2.1.0](https://github.com/guidesmiths/systemic-redis/releases/tag/v2.1.0), [2.1.1](https://github.com/guidesmiths/systemic-redis/releases/tag/v2.1.1) or [2.2.0](https://github.com/guidesmiths/systemic-redis/releases/tag/v2.2.0) is discouraged because the versioning is not correct and there are breaking changes that may break your application.

Please, upgrade directly from version [2.0.1](https://github.com/guidesmiths/systemic-redis/releases/tag/v2.0.1) to version [3.0.0](https://github.com/guidesmiths/systemic-redis/releases/tag/v3.0.0), or keep using version 2.0.1.

## Usage

```js
const System = require('systemic')
const redis = require('systemic-redis')

new System()
    .configure({
        redis: {
            url: 'redis://127.0.0.1/1'
        }
    })
    .add('logger', console)
    .add('redis', redis()).dependsOn('config', 'logger')
    .start((err, components) => {
        // Do stuff with components.redis
    })
```
