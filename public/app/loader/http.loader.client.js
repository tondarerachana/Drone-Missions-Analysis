(function () {
    angular.module('DroneMissionAnalyzer')
        .factory('httpLoaderInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {
            // Active request count
            let requestCount = 0;

            function startRequest(config) {
                // If no request ongoing, then broadcast start event
                if (!requestCount) {
                    $rootScope.$broadcast('httpLoaderStart');
                }

                requestCount++;
                return config;
            }

            function endRequest(arg) {
                // No request ongoing, so make sure we don’t go to negative count
                if (!requestCount)
                    return;

                requestCount--;
                // If it was last ongoing request, broadcast event
                if (!requestCount) {
                    $rootScope.$broadcast('httpLoaderEnd');
                }

                return arg;
            }

            // optional method
            function endResponseError(rejection) {
                // No request ongoing, so make sure we don’t go to negative count
                if (!requestCount)
                    return;

                requestCount--;
                // If it was last ongoing request, broadcast event
                if (!requestCount) {
                    $rootScope.$broadcast('httpLoaderEnd');
                }

                return $q.reject(rejection);
            }

            // Return interceptor configuration object
            return {
                'request': startRequest,
                'requestError': endRequest,
                'response': endRequest,
                'responseError': endResponseError
            };
        }])
})();

