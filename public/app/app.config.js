(function () {
    angular
        .module("DroneMissionAnalyzer")
        .config(configuration)
        .run(setPageTitle);

    function configuration($routeProvider, $httpProvider) {
        $httpProvider.interceptors.push('httpLoaderInterceptor');
        
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/json;charset=utf-8';

        $routeProvider
            .when("/login", {
                templateUrl: 'app/user/login.view.client.html',
                controller: 'LoginController',
                controllerAs: "model",
                title: 'Login'
            })
            .when("/user", {
                templateUrl: 'app/user/profile.view.client.html',
                controller: "ProfileController",
                controllerAs: "model",
                title: 'Profile',
                resolve: {
                    isLoggedIn: isLoggedIn,
                }
            })
            .when("/user/:uid", {
                templateUrl: 'app/user/profile.view.client.html',
                controller: 'ProfileController',
                controllerAs: "model",
                title: 'Profile',
                resolve: {
                    isLoggedIn: isLoggedIn,
                }
            })
            .when("/user/:uid/plan", {
                templateUrl: 'app/plan/download.view.client.html',
                controller: 'DownloadController',
                controllerAs: "model",
                title: 'Download Mission Plan',
                resolve: {
                    isLoggedIn: isLoggedIn,
                }
            })
            .when("/user/:uid/mission", {
                templateUrl: 'app/mission/validate.view.client.html',
                controller: 'ValidateController',
                controllerAs: "model",
                title: 'Validate Mission',
                resolve: {
                    isLoggedIn: isLoggedIn,
                }
            })
            .when("/", {
                redirectTo: "/login"
            })
            .otherwise({
                redirectTo: "/"
            });

        function isLoggedIn($q, UserService, $location) {
            let deferred = $q.defer();
            UserService
                .isLoggedIn()
                .success(
                    function (user) {
                        if (user !== '0') {
                            deferred.resolve();
                        } else {
                            deferred.reject();
                            $location.url("/login");
                        }
                    }
                );
            return deferred.promise;
        }
    }

    function setPageTitle($rootScope) {
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
            $rootScope.title = current.$$route.title;
        });
    }

})();
