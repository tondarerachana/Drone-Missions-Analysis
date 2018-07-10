(function () {
    angular.module('DroneMissionAnalyzer').directive('httpLoader', function () {
        return {
            restrict: 'EA',
            link: function (scope, element) {
                // Store original display mode of element
                let shownType = element.css('display');

                function hideElement() {
                    element.css('display', 'none');
                }

                scope.$on('httpLoaderStart', function () {
                    element.css('display', shownType);
                });

                scope.$on('httpLoaderEnd', hideElement);

                // Initially hidden
                hideElement();
            }
        };
    })
})();
