(function () {
    angular
        .module("DroneMissionAnalyzer")
        .factory('MissionService', missionService);

    function missionService($http) {
        return {
            "validateMission": validateMission
        };

        function validateMission(userID, missionData) {
            return $http.post("/user/" + userID + "/mission", missionData);
        }
    }
})();
