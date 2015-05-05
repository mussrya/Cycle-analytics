// Controller for the home page
app.controller('stationHome', function ($scope, $http, $window, $location, $interval) {

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
            // Options for the charts
            $scope.defaults = {
                // Boolean - Whether to animate the chart
                animation: true,
                // Number - Number of animation steps
                animationSteps: 30,
                // String - Animation easing effect
                animationEasing: "easeOutQuart",
                // Boolean - If we should show the scale at all
                showScale: true,
                // Boolean - If we want to override with a hard coded scale
                scaleOverride: true,
                // ** Required if scaleOverride is true **
                // Number - The number of steps in a hard coded scale
                scaleSteps: 10,
                // Number - The value jump in the hard coded scale
                scaleStepWidth: 150,
                // Number - The scale starting value
                scaleStartValue: 9000,
                // String - Colour of the scale line
                scaleLineColor: "rgba(0,0,0,.1)",
                // Number - Pixel width of the scale line
                scaleLineWidth: 1,
                // Boolean - Whether to show labels on the scale
                scaleShowLabels: true,
                // Interpolated JS string - can access value
                scaleLabel: "<%=value%> bikes",
                // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
                scaleIntegersOnly: true,
                // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
                scaleBeginAtZero: true,
                // String - Scale label font declaration for the scale label
                scaleFontFamily: "'Helvetica'",
                // Number - Scale label font size in pixels
                scaleFontSize: 12,
                // String - Scale label font weight style
                scaleFontStyle: "normal",
                // String - Scale label font colour
                scaleFontColor: "#666",
                // Boolean - whether or not the chart should be responsive and resize when the browser does.
                responsive: true,
                // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
                maintainAspectRatio: false,
                // String - Template string for single tooltips
                tooltipTemplate: "<%= value %> bikes",
                // String - Template string for multiple tooltips
                multiTooltipTemplate: "<%= value %>",
                // Number - amount extra to add to the radius to cater for hit detection outside the drawn point
                pointHitDetectionRadius: 1
            }
            $scope.stationLiveOptions = $scope.defaults;

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

            $scope.stationLiveOptions.scaleStartValue = 8000;
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