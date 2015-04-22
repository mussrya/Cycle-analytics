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
    $scope.bikesRentedRequest = function ($http) {
        $http.get($scope.host + 'homeBikesRented').success(function (data, status, headers, config) {
            if (data) {
                $scope.totalRented = JSON.parse(data);
            } else {
                $scope.errorMessage = true;
            }
        }).
        error(function (data, status, headers, config) {
            $scope.errorMessage = true;
        });
    }

    $scope.bikeTotalRequest($http);
    $scope.slotTotalRequest($http);
    $scope.bikesRentedRequest($http);

});