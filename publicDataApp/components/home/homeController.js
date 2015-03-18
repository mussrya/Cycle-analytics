// Controller for the Home page
app.controller('publicHome', function ($scope, $http, $window, $location) {

    // Defining core variables
    $scope.dataRealTimeChildNumber = 0;
    $scope.selected = undefined;

    // Used to switch out hosts for mobile testing
    $scope.host = 'http://localhost:8080/api/v1/';
    //$scope.host = 'http://192.168.0.8:8080/api/v1/';

    // Function for clicking a station within search
    $scope.callBack = function ($item, $model) {
        $scope.dataRealTimeChild = [];
        $scope.dataRealTimeChild[0] = $item;
    };

    // Function to prevent infinate scroll when 1 station is selected
    $scope.$watchCollection('selected', function () {
        if ($scope.selected == '') {
            $scope.dataRealTimeChildNumber = 0;
            $scope.setDataRealTime();
        }
    });

    // Function to request data from the Node API
    $scope.dataRequest = function ($requestType, $http) {
        if ($requestType === 'stationsRealTime') {
            $http.get($scope.host + 'stationsActive').success(function (data, status, headers, config) {
                $scope.dataRealTime = JSON.parse(data);
                $scope.setDataRealTime();
            }).
            error(function (data, status, headers, config) {
                console.log('error');
            });
        }
    }

    // Function to set the station data
    $scope.setDataRealTime = function () {
        $scope.dataRealTimeChildNumber = $scope.dataRealTimeChildNumber + 10;
        $scope.dataRealTimeChild = $scope.dataRealTime.slice(0, $scope.dataRealTimeChildNumber + 10);
    }

    // Function to provide infinate scroll functinality
    $scope.infinate = angular.element($window).bind("scroll", function () {
        var el = document.querySelector("#loadMore");
        var top = el.getBoundingClientRect().top;
        if (el.getBoundingClientRect().top <= 700 && ($scope.selected === '' || $scope.selected === undefined)) {
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
    $scope.data = $scope.dataRequest('chart', $http);
});