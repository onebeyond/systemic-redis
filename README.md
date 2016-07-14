# systemic-redis
A [systemic](https://github.com/guidesmiths/systemic) redis component

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
