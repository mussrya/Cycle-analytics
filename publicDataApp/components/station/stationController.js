// stationController.js
// Controller for the individual station page

app.controller('stationTrends', function ($scope, $http, $window, $location, $interval, chartDefaults) {

    // Click handler for when a point on the chart is clicked (unused)
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

    $scope.host = 'http://cycleanalytics.io:8080/api/v1';

    // Getting the ID from the URL path
    $scope.stationId = $location.$$path;
    $scope.stationId = $scope.stationId.split('/');
    $scope.stationId = $scope.stationId[2];

    // Request for station information (title etc.)
    $scope.stationRequest = function ($http) {
        $http.get($scope.host + '/station/' + $scope.stationId).success(function (data, status, headers, config) {
            $scope.stationData = JSON.parse(data);
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });

    }

    // Request for the station chart data (last 60 minutes chart)
    $scope.stationLive = function ($http) {
        $http.get($scope.host + '/stationLive/' + $scope.stationId).success(function (data, status, headers, config) {
            $scope.stationLiveData = JSON.parse(data);

            $scope.stationLiveOptions = chartDefaults;
            $scope.stationLiveOptions.scaleStepWidth = 5;
            $scope.stationLiveOptions.scaleStartValue = 0;
            $scope.stationLiveOptions.scaleSteps = $scope.stationLiveData[0].nbDocks / 5;

            // Defining the chart structure
            var chartData = {
                labels: [],
                series: [],
                data: [[]],
                colours: ['#03A9F4']
            };
            chartData.series = ['stations'];

            // Looping through the data to build the chart
            for (var i = 0, len = $scope.stationLiveData.length; i < len; i++) {
                if ($scope.stationLiveData[i]) {
                    var date = new Date($scope.stationLiveData[i].timestamp);
                    var minutes = date.getMinutes();
                    if (minutes < 10) {
                        minutes = "0" + minutes.toString();
                    }
                    var hours = date.getHours();
                    if (hours < 10) {
                        hours = "0" + hours.toString();
                    }

                    var stationDate = hours + ':' + minutes;

                    if (i % 3 == 0) {
                        chartData.labels.push(stationDate);
                    } else {
                        chartData.labels.push('');
                    }
                    chartData.data[0].push($scope.stationLiveData[i].nbBikes);
                }
            }

            // Updating the chart data
            $scope.data = chartData;
            $scope.apply;
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    };


    // Request for the hourly average chart
    $scope.stationHourly = function ($http) {
        $http.get($scope.host + '/stationHourly/' + $scope.stationId).success(function (data, status, headers, config) {
            $scope.stationHourlyData = JSON.parse(data);

            $scope.stationHourlyOptions = chartDefaults;
            $scope.stationHourlyOptions.scaleSteps = $scope.stationHourlyData[0].nbDocks / 5;

            // Defining the chart structure
            var chartData = {
                labels: [],
                series: [],
                data: [[]],
                colours: ['#03A9F4']
            };
            chartData.series = ['stations'];

            // Looping through the data to build the chart
            for (var i = 0, len = $scope.stationHourlyData.length; i < len; i++) {
                if ($scope.stationHourlyData[i]) {
                    var date = new Date($scope.stationHourlyData[i].timestamp);
                    var minutes = date.getMinutes();
                    if (minutes < 10) {
                        minutes = "0" + minutes.toString();
                    }
                    var hours = date.getHours();
                    if (hours < 10) {
                        hours = "0" + hours.toString();
                    }

                    var stationDate = hours + ':' + minutes;
                    if (i % 3 == 0) {
                        chartData.labels.push(stationDate);
                    } else {
                        chartData.labels.push('');
                    }

                    chartData.data[0].push($scope.stationHourlyData[i].nbBikes);
                }
            }

            // Updating the chart data
            $scope.dataHourly = chartData;
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    };

    // Request for the daily average chart
    $scope.stationDaily = function ($http) {
        $http.get($scope.host + '/stationDaily/' + $scope.stationId).success(function (data, status, headers, config) {
            $scope.stationDailyData = JSON.parse(data);

            $scope.stationDailyOptions = chartDefaults;
            $scope.stationDailyOptions.scaleSteps = $scope.stationDailyData[0].nbDocks / 5;

            // Defining the chart structure
            var chartData = {
                labels: [],
                series: [],
                data: [[]],
                colours: ['#03A9F4']
            };
            chartData.series = ['stations'];

            // Looping through the data to build the chart
            for (var i = 0, len = $scope.stationDailyData.length; i < len; i++) {
                if ($scope.stationDailyData[i]) {
                    var date = new Date($scope.stationDailyData[i].timestamp);
                    date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
                    chartData.labels.push(date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear());
                    chartData.data[0].push($scope.stationDailyData[i].nbBikes);

                }
            }

            // Updating the chart data
            $scope.dataDaily = chartData;
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    };

    // Updates the (last 10 minutes) chart data every 35 seconds
    $scope.liveReload = function () {
        $scope.liveReloadVar = $interval(function () {
            $scope.stationLiveData = $scope.stationLive($http);
        }, 35000);
    };

    // Function for stopping the setInterval
    $scope.stopLiveReload = function () {
        $interval.cancel($scope.liveReloadVar);
    };

    // Cancel the live reload function
    $scope.$on('$destroy', function () {
        $interval.cancel($scope.liveReloadVar);
    });

    // Function which is called from the front-end to re-load the live data
    $scope.loadLive = function () {
        $scope.stopLiveReload();
        $scope.stationLiveData = '';
        $scope.stationLiveData = $scope.stationLive($http);
        $scope.liveReload();
    };

    // Function which is called from the front-end to re-load the hourly average data
    $scope.loadHourly = function () {
        $scope.stopLiveReload();
        $scope.stationHourlyData = '';
        $scope.dataHourly = '';
        $scope.stationHourlyData = $scope.stationHourly($http);
    };

    // Function which is called from the front-end to re-load the daily average data
    $scope.loadDaily = function () {
        $scope.stopLiveReload();
        $scope.stationDailyData = '';
        $scope.dataDaily = '';
        $scope.stationDailyData = $scope.stationDaily($http);
    };

    // Start the live reload function
    $scope.liveReload();

    // Initial calls to get the data required
    $scope.stationData = $scope.stationRequest($http);

    // WIP - Dummy array until the real functionality has been added
    $scope.bestTimes = [{
        day: 'Mon',
        morning: new Date(),
        evening: new Date()
    }, {
        day: 'Tues',
        morning: new Date(),
        evening: new Date()
    }, {
        day: 'Weds',
        morning: new Date(),
        evening: new Date()
    }, {
        day: 'Thurs',
        morning: new Date(),
        evening: new Date()
    }, {
        day: 'Fri',
        morning: new Date(),
        evening: new Date()
    }];

});