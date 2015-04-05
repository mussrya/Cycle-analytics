// Controller for the Home page
app.controller('publicHome', function ($scope, $http, $window, $location, $filter) {

    // Defining core variables
    $scope.dataRealTimeChildNumber = 0;
    $scope.selected = undefined;

    $scope.host = 'http://192.30.192.15:8080/api/v1/';

    // Function to prevent infinate scroll when 1 station is selected
    $scope.searchValue = function () {
        if ($scope.selected === '') {
            $scope.dataRealTimeChildNumber = 0;
            $scope.setDataRealTime();
        }
    };
    // Function to request data from the Node API
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
        $scope.selected = undefined;
        $scope.dataRealTimeChildNumber = 0;
        $scope.setDataRealTime();
    }

    // Function to provide infinate scroll functinality
    $scope.infinate = angular.element($window).bind("scroll", function () {
        var el = document.querySelector("#loadMore");
        var top = el.getBoundingClientRect().top;
       
        if (el.getBoundingClientRect().top <= 800 && ($scope.selected === '' || $scope.selected === undefined)) {
            $scope.$apply(function () {
                $scope.dataRealTimeChildNumber = $scope.dataRealTimeChildNumber + 10;
                $scope.dataRealTimeChild = $scope.dataRealTime.slice(0, $scope.dataRealTimeChildNumber + 10);
            });
        }
    });

    $scope.changeView = function (station) {
        $window.scrollTo(0, 0);
        $scope.infinate.unbind();
        var stationPath = '/station/' + station;
        $location.path(stationPath);
    }

    // Calls to functions on initial load
    $scope.dataRealTime = $scope.dataRequest('stationsRealTime', $http);
});