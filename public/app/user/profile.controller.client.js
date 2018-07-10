(function () {
    angular
        .module("DroneMissionAnalyzer")
        .controller("ProfileController", profileController);

    function profileController($routeParams, UserService, $location) {
        let vm = this;
        vm.userID = $routeParams['uid'];
        vm.logout = logout;

        function init() {
            UserService.findCurrentUser()
                .then(function (response) {
                    vm.user = response.data;
                }, function (err) {
                    vm.error = err.data.message;
                    console.log(err);
                });
        }

        init();

        function logout() {
            UserService.logout()
                .then(function (response) {
                    $location.url("/login");
                });
        }
    }
})();
