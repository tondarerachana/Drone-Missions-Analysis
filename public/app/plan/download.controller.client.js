(function () {
    angular
        .module("DroneMissionAnalyzer")
        .controller("DownloadController", downloadController);

    function downloadController(PlanService, $routeParams) {
        let vm = this;
        vm.userID = $routeParams['uid'];

        vm.plans = [];

        function init() {
            PlanService.getAllPlansByUser(vm.userID)
                .then(function (response) {
                    let data = response.data;
                    let objects = data.Contents;

                    objects.forEach((obj) => {
                        let split = obj.Key.split("/");
                        let planName = split[split.length - 1];
                        let mapping = {
                            key: planName,
                            url: obj.preSignedURL
                        };
                        vm.plans.push(mapping);
                    });

                    if (objects.length === 0) {
                        vm.error = "Oops..You don't have any alloted plans!";
                    }
                }, function (err) {
                    vm.error = err.data.message;
                });
        }

        init();
    }
})();