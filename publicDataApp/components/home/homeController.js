// Controller for the Home page
app.controller('publicHome', function ($scope, $http, $window) {

    // Options for the charts
    $scope.options = {

        // Number - Number of animation steps
        animationSteps: 10,

        // Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius: 1,

        // Boolean - Whether to show a stroke for datasets
        datasetStroke: true,

    }

    // Click handler for when a point on the chart is clicked
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

    // Defining core variables
    $scope.dataRealTimeChildNumber = 0;
    $scope.selected = undefined;

    // Used to switch out hosts for mobile testing
    //$scope.host = 'http://localhost:8080/api/v1/';
    $scope.host = 'http://192.168.0.8:8080/api/v1/';

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
        } else {
            $http.get($scope.host + 'stationsActive').success(function (data, status, headers, config) {
                var chartData = {
                    labels: [],
                    series: [],
                    data: [],
                    colours: ['#03A9F4']
                };
                chartData.data.push([]);
                var station = JSON.parse(data);
                chartData.series = ['stations'];
                for (var i = 0, len = station.length; i < 60; i++) {
                    chartData.labels.push(station[i].name);
                    chartData.data[0].push(station[i].nbBikes[0]);
                }
                $scope.data = chartData;
            }).
            error(function (data, status, headers, config) {
                    console.log('error');
                }

            );

        }
    }

    // Function to set the station data
    $scope.setDataRealTime = function () {
        $scope.dataRealTimeChildNumber = $scope.dataRealTimeChildNumber + 10;
        $scope.dataRealTimeChild = $scope.dataRealTime.slice(0, $scope.dataRealTimeChildNumber + 10);
    }

    // Function to provide infinate scroll functinality
    angular.element($window).bind("scroll", function () {
        var el = document.querySelector("#loadMore");
        var top = el.getBoundingClientRect().top;
        if (el.getBoundingClientRect().top <= 700 && ($scope.selected === '' || $scope.selected === undefined)) {
            $scope.$apply(function () {
                $scope.dataRealTimeChildNumber = $scope.dataRealTimeChildNumber + 10;
                $scope.dataRealTimeChild = $scope.dataRealTime.slice(0, $scope.dataRealTimeChildNumber + 10);
            });
        }
    });
    
    // Calls to functions on initial load
    $scope.dataRealTime = $scope.dataRequest('stationsRealTime', $http);
    $scope.data = $scope.dataRequest('chart', $http);
});