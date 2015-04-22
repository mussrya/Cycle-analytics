// Controller for the Stations page
app.controller('publicStations', function ($scope, $http, $window, $location, $filter) {

    // Defining core variables
    $scope.dataRealTimeChildNumber = 0;
    $scope.selected = undefined;
    // This is set so angular animation works on first page load
    $scope.dataRealTimeChild = [];
    $scope.host = 'http://cycleanalytics.io:8080/api/v1/';

    // Function to prevent infinate scroll when 1 station is selected
    $scope.searchValue = function () {
        if ($scope.selected === '') {
            $scope.dataRealTimeChildNumber = 0;
            $scope.setDataRealTime();
        }
    };
    
    // Function to request data from the Node API to get the list of stations on the /stations page
    $scope.dataRequest = function ($requestType, $http) {
        if ($requestType === 'stationsRealTime') {
            $http.get($scope.host + 'stationsActive').success(function (data, status, headers, config) {
                if (data) {
                    $scope.dataRealTime = JSON.parse(data);
                    $scope.setDataRealTime();
                } else {
                    $scope.errorMessage = true;
                }
            }).
            error(function (data, status, headers, config) {
                $scope.errorMessage = true;
            });
        }
    }

    // Function to set the station data
    $scope.setDataRealTime = function () {
        $scope.dataRealTimeChildNumber = $scope.dataRealTimeChildNumber + 10;
        $scope.dataRealTimeChild = $scope.dataRealTime.slice(0, $scope.dataRealTimeChildNumber + 10);
    }

    $scope.reset = function () {
        $scope.dataRealTimeChildNumber = 0;
        $scope.setDataRealTime();
    }

    // Function to provide infinate scroll functinality
    $scope.infinate = function () {
        if ($scope.dataRealTime) {
            // Locate the hidden load button and the top of the scroll
            var el = document.querySelector("#loadMore");
            var top = el.getBoundingClientRect().top;

            // Check it's within X pixels of the load button before initiating the loading of more results
            if (el.getBoundingClientRect().top <= 800 && ($scope.selected === '' || $scope.selected === undefined)) {
                $scope.$apply(function () {
                    console.log(el.getBoundingClientRect().top);
                    $scope.dataRealTimeChildNumber = $scope.dataRealTimeChildNumber + 10;
                    $scope.dataRealTimeChild = $scope.dataRealTime.slice(0, $scope.dataRealTimeChildNumber + 10);
                });
            }
        }
    }

    // When the scope is destroyed, unbind the infinate scroll function and scroll to the top of the page
    $scope.$on("$destroy", function () {
        // Scroll to top
        $window.scrollTo(0, 0);

        // Unbind scroll when leaving the view
        angular.element($window).unbind("scroll", $scope.infinate);
    });

    // Bind the infinate scroll function to window
    angular.element($window).bind("scroll", $scope.infinate);


    // Calls to functions on initial load
    $scope.dataRealTime = $scope.dataRequest('stationsRealTime', $http);
});