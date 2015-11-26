
/**!
 * AngularJS localStorageCacheFactory that mimics the functionality of $cacheFactory
 * @author  Shane O'Sullivan <hitsuji@tenmilesout.net>
 * @version 0.1.0
 */

(function (window, localStorage, undefined) {
    'use strict';

    var localStorageCacheFactory = angular.module('localStorageCacheFactory', []);

    localStorageCacheFactory.provider('$localStorageCacheFactory', ['$cacheFactoryProvider', '$rootElementProvider', function $LocalStorageCacheFactoryProvider ($cacheFactoryProvider, $rootElementProvider) {
        // get a unique instance of $cacheFactory so we don't end up with clashes
        var $cacheFactory = $cacheFactoryProvider.$get();
        // we get our namespace from the ng-app value to prevent app clashes
        var $rootElement = $rootElementProvider.$get();

        var prefix = '$$LSCF$$';
        // use '' as global namespace if no ng-app modules is declared
        var namespace = $rootElement.attr('ng-app') || '';

        var caches = {};

        function LocalStorageCache (cacheId, options) {
            this.cacheId = cacheId;
            this.secondaryCache = $cacheFactory(cacheId, options);
            this.options = options;

            this.prefix = prefix + namespace + '::' + cacheId + '::';
        }

        LocalStorageCache.prototype = {
            get: function (key) {
                var value = localStorage.getItem(this.prefix + key);

                if (!value) {
                    value = this.secondaryCache.get(key);
                }

                return value;
            },

            put: function (key, value) {
                if (value === undefined) {
                    return;
                }

                if (typeof value === 'string') {
                    localStorage.setItem(this.prefix + key, value);
                    this.secondaryCache.remove(key);
                } else {
                    this.secondaryCache.put(key, value);
                    localStorage.removeItem(this.prefix + key);
                }
            },

            remove: function (key) {
                localStorage.removeItem(this.prefix + key);
                this.secondaryCache.remove(key);
            },

            removeAll: function () {
                for (var i = 0, t = localStorage.length; i < t; i++) {
                    var key = localStorage.key(i);

                    if (key && key.substring(0, this.prefix.length) === this.prefix) {
                        localStorage.removeItem(key);
                        i--;
                    }
                }

                this.secondaryCache.removeAll();
            },

            destroy: function () {
                this.removeAll();
                this.secondaryCache.destroy();

                delete caches[this.cacheId];

                this.cacheId = null;
                this.secondaryCache = null;
                this.options = null;
                this.prefix = null;
            },

            info: function () {
                var info = this.secondaryCache.info();

                // count the localStorage vars that we use
                for (var i = 0, t = localStorage.length; i < t; i++) {
                    var key = localStorage.key(i);

                    if (key.substring(0, this.prefix.length) === this.prefix) {
                        info.size++;
                    }
                }

                return info;
            }
        }

        function $localStorageCacheFactory (cacheId, options) {
            if (typeof cacheId !== 'string' || cacheId === '') {
                throw new Error('[$localStorageCacheFactory] Invalid cacheId given!');
            }

            if (!caches[cacheId]) {
                caches[cacheId] = new LocalStorageCache(cacheId, options);
            }

            return caches[cacheId];
        }

        $localStorageCacheFactory.prefix = prefix;

        this.$get = [function () {
            // Default to $cacheFactory if localStorage isn't available
            if (!localStorage) {
                return $cacheFactory;
            } else {
                return $localStorageCacheFactory;
            }
        }];

        this.clear = function (cacheId) {
            var keyPrefix = prefix + namespace + '::' + (cacheId ? cacheId : '');

            // clear all matching localStorage vars (a cache object may not yet be loaded for the vars)
            for (var i = 0, t = localStorage.length; i < t; i++) {
                var key = localStorage.key(i);

                if (key && key.substring(0, keyPrefix.length) === keyPrefix) {
                    localStorage.removeItem(key);
                    i--;
                }
            }

            // clear a give cache if a cacheId was provided
            if (cacheId && caches[cacheId]) {
                caches[cacheId].removeAll();
            }

            // if no cacheId was provided clear all caches
            if (!cacheId) {
                for (var cacheId in caches) if (caches.hasOwnProperty(cache)) {
                    caches[cacheId].removeAll();
                }
            }
        }
    }]);


})(window, window.localStorage);
