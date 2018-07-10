(function () {
    angular
        .module("DroneMissionAnalyzer")
        .controller("ValidateController", validateController);

    function validateController(MissionService, $routeParams) {
        let vm = this;
        vm.userID = $routeParams['uid'];
        vm.images = [];
        vm.planData = [];
        vm.plan = [];
        vm.metaData = [];

        vm.toggle = {};
        vm.toggle.switch = false;

        vm.uploadImages = function (files) {
            vm.images = files.slice();
            vm.toggle.switch = false;
            vm.error = "";
            vm.success = "";

            if (vm.images && vm.images.length) {
                vm.metaData = generateMetaData(vm.images);
            }
        };

        vm.uploadPlan = function (file) {
            vm.plan = [];
            vm.plan.push(file);

            vm.toggle.switch = false;
            vm.error = "";
            vm.success = "";

            if (file) {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        vm.planData = results.data;
                    }
                });
            }
        };

        let sortByFiles = () => {
            let sorted = [];

            vm.images.forEach(image => {
                sorted.push((vm.metaData.filter(metaObj => image.name === metaObj.name))[0]);
            });

            return sorted;
        };

        vm.validate = function () {
            if (vm.images.length === 0) {
                vm.error = "Please upload images";
                return;
            }

            if (vm.plan.length === 0) {
                vm.error = "Please upload a plan";
                return;
            }

            vm.metaData = vm.metaData.length !== 0 ? sortByFiles() : [];

            let missionData = {
                imageMetaData: vm.metaData,
                planData: vm.planData
            };

            if (vm.metaData.length !== vm.planData.length) {
                vm.error = "Upload plan and images don't correspond.";
                return;
            }

            vm.metaData_coords = vm.metaData.map((obj) => {
                return [obj.latitude, obj.longitude];
            });

            vm.planData_coords = vm.planData.map((obj) => {
                return [obj.latitude, obj.longitude];
            });

            MissionService.validateMission(vm.userID, missionData)
                .then(response => {
                    vm.success = "Mission Pass";
                }, (err) => {
                    vm.error = "Mission Fail";
                    vm.evaluatedWayPoints = err.data;
                });
        };

        function generateMetaData(files) {
            let metadata = [];

            files.forEach(async (file) => {
                EXIF.enableXmp();
                await EXIF.getData(file, function () {
                    if (Object.keys(file.xmpdata).length === 0 && file.xmpdata.constructor === Object ||
                        Object.keys(file.exifdata).length === 0 && file.exifdata.constructor === Object) {
                        vm.error = "No metadata found in the images";
                        return;
                    }
                    let xmpData = file.xmpdata['x:xmpmeta']['rdf:RDF']['rdf:Description']['@attributes'];
                    let lat = (EXIF.getTag(this, "GPSLatitude") + "").split(",");
                    let long = (EXIF.getTag(this, "GPSLongitude") + "").split(",");
                    let alt = (EXIF.getTag(this, "GPSAltitude") + "");

                    let latRef = EXIF.getTag(this, "GPSLatitudeRef");
                    let longRef = EXIF.getTag(this, "GPSLongitudeRef");

                    let declat = convertDMSToDD(lat[0], lat[1], lat[2], latRef);
                    let declong = convertDMSToDD(long[0], long[1], long[2], longRef);

                    metadata.push({
                        "latitude": declat,
                        "longitude": declong,
                        "altitude": alt,
                        "heading": xmpData['drone-dji:FlightYawDegree'],
                        "gimbalPitchAngle": xmpData['drone-dji:GimbalPitchDegree'],
                        "name": file.name
                    });
                });
            });

            return metadata;
        }

        function convertDMSToDD(degrees, minutes, seconds, direction) {
            let dd = Number(degrees) + Number(minutes) / 60 + Number(seconds) / (60 * 60);

            if (direction === "S" || direction === "W") {
                dd = dd * -1;
            }
            return dd;
        }

    }
})();
