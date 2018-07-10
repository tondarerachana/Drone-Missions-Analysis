(function () {
    angular
        .module("DroneMissionAnalyzer")
        .controller("LoginController", loginController);

    function loginController(UserService, $location) {
        let vm = this;
        vm.login = login;

        function login(user) {
            if (user) {
                UserService.login(user)
                    .then(function (response) {
                        let loggedInUser = response.data;
                        if (loggedInUser) {
                            $location.url('/user/' + loggedInUser.username);
                        } else {
                            vm.error = 'User not found';
                        }
                    }, function (err) {
                        vm.error = err.data.message;
                    });
            } else {
                vm.error = 'Please enter correct credentials';
            }
        }
    }
})();