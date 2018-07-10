(function () {
    angular
        .module("DroneMissionAnalyzer")
        .factory('UserService', userService);

    function userService($http) {
        return {
            "login": login,
            "isLoggedIn": isLoggedIn,
            "logout": logout,
            "findCurrentUser": findCurrentUser
        };

        function findCurrentUser() {
            return $http.get("/user");
        }

        function logout() {
            return $http.post("/logout");
        }

        function login(user) {
            return $http.post("/login", user);
        }

        function isLoggedIn() {
            return $http.post("/isLoggedIn");
        }
    }
})();
