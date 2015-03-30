// Controller for the Station trends page
app.controller('stationTrends', function ($scope, $http, $window, $location, $interval) {

    // Options for the charts
    $scope.options = {
        // Boolean - Whether to animate the chart
        animation: true,
        // Number - Number of animation steps
        animationSteps: 100,
        // String - Animation easing effect
        animationEasing: "easeOutQuart",
        // Boolean - If we should show the scale at all
        showScale: true,
        // Boolean - If we want to override with a hard coded scale
        scaleOverride: true,
        // ** Required if scaleOverride is true **
        // Number - The number of steps in a hard coded scale
        scaleSteps: 5,
        // Number - The value jump in the hard coded scale
        scaleStepWidth: 10,
        // Number - The scale starting value
        scaleStartValue: 0,
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
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
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

    // Click handler for when a point on the chart is clicked (unused)
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

    // Used to switch out hosts for mobile testing
    $scope.host = 'http://192.30.192.15:8080/api/v1';
    //$scope.host = 'http://192.168.0.8:8080/api/v1';

    // Getting the ID from the URL path
    $scope.stationId = $location.$$path;
    $scope.stationId = $scope.stationId.split('/');
    $scope.stationId = $scope.stationId[2];

    // Request for station information (title etc.)
    $scope.stationRequest = function ($http) {
        $http.get($scope.host+'/station/' + $scope.stationId).success(function (data, status, headers, config) {
            $scope.stationData = JSON.parse(data);
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });

    }

    // Request for the station chart data (last 10 minutes chart)
    $scope.stationLive = function ($http) {
        $http.get($scope.host+'/stationLive/' + $scope.stationId).success(function (data, status, headers, config) {
            $scope.stationLiveData = JSON.parse(data);

            // Defining the chart structure
            var chartData = {
                labels: [],
                series: [],
                data: [[]],
                colours: ['#03A9F4']
            };
            chartData.series = ['stations'];

            // Looping through the data to build the chart
            var counterLoop = 0;
            for (var i = 0, len = $scope.stationLiveData.length; i < len; i++) {
                if ($scope.stationLiveData[i]) {
                    var date = new Date($scope.stationLiveData[i].timestamp);
                    var minutes = date.getMinutes();
                    var hours = date.getHours();
                    var stationDate = hours + ' : ' + minutes;
                    
                    
                    if (counterLoop == 0) {
                        chartData.labels.push(stationDate);
                        counterLoop++;
                    }else if(counterLoop < 3){
                        chartData.labels.push('');
                        counterLoop++;
                    }else{
                        chartData.labels.push('');
                        counterLoop = 0;
                    }
                    chartData.data[0].push($scope.stationLiveData[i].nbBikes);
                    
                }
            }

            // Updating the chart data
            $scope.data = chartData;
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

    // function for stopping the setInterval
    $scope.stopLiveReload = function () {
        $interval.cancel($scope.liveReloadVar);
    };

    $scope.$on('$destroy', function () {
        $interval.cancel($scope.liveReloadVar);
    });

    // Initial calls to get the data required
    $scope.stationData = $scope.stationRequest($http);
    $scope.stationLiveData = $scope.stationLive($http);
    $scope.liveReload();

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