# cached-open-exchange-rates-sdk
Open Exchange Rates SDK that caches results to avoid hitting the usage limit

# Usage

```js
const coxr = require('cached-open-exchange-rates');
const oxr = coxr(
  // Cache configurations
  {
    path: '.open-exchange-rates-cache.json', // cache file, for persistance even on restarts
    duration: 'PT12H' // 12 hour cache, must be an ISO duration -- https://en.wikipedia.org/wiki/ISO_8601#Durations
  },
  // Open Exchange Rate configurations
  // This object is passed to the OXR SDK -- https://github.com/openexchangerates/npm-exchange-rates
  {
    app_id: '1234...' // Open Exchange Rate App ID
  }
);

await oxr.request(); // Directly requests from OXR
await oxr.cached(); // Tries the cache, throws an error if there is no cached value
await oxr.cachedOrRequest(); // Tries the cache and requests from OXR if is not present
```
