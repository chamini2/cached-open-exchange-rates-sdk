const oxr = require('open-exchange-rates');
const clone = require('lodash.clone');
const moment = require('moment');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const INVALID_CACHE_MESSAGE = 'Open Exchange Rates cache is invalid';

module.exports = function(cache_config, oxr_config) {
  // cache setup
  const adapter = new FileSync(cache_config.path);
  const db = low(adapter);

  db.defaults({})
    .write();

  // OXR setup
  oxr.set(oxr_config);

  const max_cache_duration = moment.duration(cache_config.duration);

  return {
    cached() {
      return new Promise(function(resolve, reject) {
        const now_timestamp = new Date().valueOf();

        const last_request = db.get('last').value();
        const last_request_timestamp = last_request && last_request.timestamp || 0;
        const duration_since_last_request = moment.duration(now_timestamp - last_request_timestamp);

        if (duration_since_last_request < max_cache_duration) {
          return resolve(last_request);
        } else {
          return reject(new Error(INVALID_CACHE_MESSAGE));
        }
      });
    },

    request() {
      return new Promise(function(resolve, reject) {
        oxr.latest(function(err) {
          if (err) {
            return reject(err);
          }

          const result = clone(oxr);
          // Cache the result
          db.set('last', result)
            .write();

          return resolve(result);
        })
      });
    },

    cachedOrRequest() {
      return this.cached()
      .catch((err) => {
        if (err.message === INVALID_CACHE_MESSAGE) {
          return this.request();
        }
      });
    }
  }
}
