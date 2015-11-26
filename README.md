# local-storage-cache-factory
A cache factory that emulates $cacheFactory for AngularJS but utilises localStorage for strings

This modules serves as an alternative to $cacheFactory that allows storing strings in localStorage.

An example usage is injecting the provider into $templateCacheProvider to store html templates in localStorage and prevent unnecessary calls and excessive calls to the server to load template partials.

    myApp.config(['$templateCacheProvider', function ($templateCacheProvider) {
        $templateCache.$get[0] = '$localStorageCacheFactory';
    }]);

To improve on the above example you can set your environment variable and buildVersion variable globally to allow managing the cache:

    myApp.config(['$templateCacheProvider', '$localStorageCacheFactoryProvider', function ($templateCacheProvider, $localStorageCacheFactoryProvider) {
        if (globalVars.environment !== 'dev') {
            $templateCache.$get[0] = '$localStorageCacheFactory';

            if (globalVars.buildVersion !== localStorage.getItem('myAppBuildVersion')) {
                $localStorageCacheFactoryProvider.clear();
            }

            localStorage.setItem('myAppBuildVersion', globalVars.buildVersion);
        }
    }]);
