(function () {
    angular
        .module("DroneMissionAnalyzer")
        .factory('PlanService', planService);

    function planService($http) {
        return {
            "getAllPlansByUser": getAllPlansByUser
        };

        function getAllPlansByUser(userID) {
            return $http.get("/user/" + userID + "/plan");
        }
    }
})();
