// Controller for the home page
app.controller('stationHome', function ($scope, $http, $window, $location, $interval, chartDefaults) {

    $scope.host = 'http://cycleanalytics.io:8080/api/v1/';

    // Function to request data from the Node API to get the total number of bikes
    $scope.bikeTotalRequest = function ($http) {
        $http.get($scope.host + 'homeBikesAvail').success(function (data, status, headers, config) {
            if (data) {
                $scope.totalBikes = JSON.parse(data);
            } else {
                $scope.errorMessage = true;
            }
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    }

    // Function to request data from the Node API to get the total number of bikes
    $scope.slotTotalRequest = function ($http) {
        $http.get($scope.host + 'homeSlotsAvail').success(function (data, status, headers, config) {
            if (data) {
                $scope.totalSlots = JSON.parse(data);
            } else {
                $scope.errorMessage = true;
            }
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    }

    // Function to request data from the Node API to get the total number of bikes rented today
    $scope.slotsRequest = function ($http) {
        $http.get($scope.host + 'homeBikesTotalSlots').success(function (data, status, headers, config) {
            if (data) {
                $scope.totalSlotsAll = JSON.parse(data);
            } else {
                $scope.errorMessage = true;
            }
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    }

    // Function to request data from the Node API to get the most popular station
    $scope.popularStationRequest = function ($http) {
        $http.get($scope.host + 'homePopularStation').success(function (data, status, headers, config) {
            if (data) {
                $scope.popularStation = JSON.parse(data);
            } else {
                $scope.errorMessage = true;
            }
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    }

    // Request for the station chart data (last 60 minutes chart)
    $scope.stationLive = function ($http) {
        $http.get($scope.host + 'stationLiveOverview').success(function (data, status, headers, config) {
            $scope.stationLiveData = JSON.parse(data);
            
            // Options for the chart
            $scope.stationLiveOptions = chartDefaults;
            $scope.stationLiveOptions.scaleSteps = 10,
            $scope.stationLiveOptions.scaleStepWidth = 150;
            $scope.stationLiveOptions.scaleStartValue = 7000;

            // Defining the chart structure
            var chartData = {
                labels: [],
                series: [],
                data: [[]],
                colours: ['#03A9F4']
            };
            chartData.series = ['stations'];

            // setup some new arrays for sorting purposes
            $scope.stationLiveDataSortBikes = [];
            $scope.stationLiveDataSortSlots = [];

            // Looping through the data to build the chart
            for (var i = 0, len = $scope.stationLiveData.length; i < len; i++) {
                // push data into the arrays which be sorted later
                $scope.stationLiveDataSortBikes.push($scope.stationLiveData[i].totalBikes);
                $scope.stationLiveDataSortSlots.push($scope.stationLiveData[i].totalSlots);

                if ($scope.stationLiveData[i]) {
                    var date = new Date($scope.stationLiveData[i]["_id"]);
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
                    chartData.data[0].push($scope.stationLiveData[i].totalBikes);
                }
            }

            /*
            // this section is the logic for the labels to ensure they are outputted correctly and not "guessed"
            
            // sort the total bikes asc
            $scope.stationLiveDataSortBikes = $scope.stationLiveDataSortBikes.sort(function (a, b) {
                return a - b;
            });

            // sort the total slots desc
            $scope.stationLiveDataSortSlots = $scope.stationLiveDataSortSlots.sort(function (a, b) {
                return b - a;
            });

            // if the slots are higher than bikes run the first if, else bikes are higher so run the second
            if ($scope.stationLiveDataSortSlots[0] > $scope.stationLiveDataSortBikes[0]) {
                $scope.stationLiveOptions.scaleSteps = Math.round(Math.sqrt(($scope.stationLiveDataSortSlots[0] - $scope.stationLiveDataSortBikes[0])));
                $scope.stationLiveOptions.scaleStartValue = $scope.stationLiveDataSortBikes[0];
            } else {
                // change the ordering of the array from asc to desc, otherwise the label on the Y axis will be incorrect
                $scope.stationLiveDataSortBikes = $scope.stationLiveDataSortBikes.sort(function (a, b) {
                    return b - a;
                });
                $scope.stationLiveOptions.scaleSteps = Math.round(Math.sqrt(($scope.stationLiveDataSortBikes[0] - $scope.stationLiveDataSortSlots[0])));
                $scope.stationLiveOptions.scaleStartValue = $scope.stationLiveDataSortSlots[0];
            }

            // set the scale step width the same as the scale steps i.e. if both were 12, it would essentially run 12*12 = 144 incriment in total which would be the number difference between bikes & slots / slots & bikes
            $scope.stationLiveOptions.scaleStepWidth = $scope.stationLiveOptions.scaleSteps;
*/

            $scope.stationLiveOptions.scaleStartValue = 8200;
            // Updating the chart data
            $scope.data = chartData;
            $scope.apply;
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    };


    // Function to request data from the Node API to get the most popular station
    $scope.emptyBicycles = function ($http) {
        $http.get($scope.host + 'homeEmptyBicycles').success(function (data, status, headers, config) {
            if (data) {
                $scope.topEmptyBicycles = JSON.parse(data);
            } else {
                $scope.errorMessage = true;
            }
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    }

    // Function to request data from the Node API to get the most popular station
    $scope.emptySlots = function ($http) {
        $http.get($scope.host + 'homeEmptySlots').success(function (data, status, headers, config) {
            if (data) {
                $scope.topEmptySlots = JSON.parse(data);
            } else {
                $scope.errorMessage = true;
            }
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    }
    
    // run the initial function calls
    $scope.bikeTotalRequest($http);
    $scope.slotTotalRequest($http);
    $scope.slotsRequest($http);
    $scope.popularStationRequest($http);
    $scope.stationLive($http);
    $scope.emptyBicycles($http);
    $scope.emptySlots($http);
});