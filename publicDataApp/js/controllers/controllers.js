// Controller for the Home page
app.controller('publicHome', function ($scope, $http) {
    $scope.config = {
        title: false, // chart title. If this is false, no title element will be created.
        tooltips: true,
        labels: false, // labels on data points
        // exposed events
        mouseover: function () {},
        mouseout: function () {},
        click: function () {},
        // legend config
        legend: {
            display: false, // can be either 'left' or 'right'.
            position: 'left',
            // you can have html in series name
            htmlEnabled: false
        },
        // override this array if you're not happy with default colors
        colors: ['#00BCD4'],
        innerRadius: 2, // Only on pie Charts
        lineLegend: 'traditional', // Only on line Charts
        lineCurveType: 'cardinal', // change this as per d3 guidelines to avoid smoothline
        isAnimate: true, // run animations while rendering chart
        yAxisTickFormat: 's', //refer tickFormats in d3 to edit this value
        xAxisMaxTicks: 20, // Optional: maximum number of X axis ticks to show if data points exceed this number
        yAxisTickFormat: 's', // refer tickFormats in d3 to edit this value
        waitForHeightAndWidth: false // if true, it will not throw an error when the height or width are not defined (e.g. while creating a modal form), and it will be keep watching for valid height and width values
    };

    /*
    // Has been commented out for now as it may no longer be required
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $scope.config.isAnimate = false;
        }
    */

    $scope.data = dataRequest('requestDaily');



});

// Function to request data from the Node API
function dataRequest($requestType) {
    if ($requestType === 'requestDaily') {
        var chartData = {
            series: ['a', 'b'],
            data: [{
                x: 'a',
                y: [2]
            }, {
                x: 'b',
                y: [20]
            }]
        };

        return chartData;
    }
}

// Controller for the header
app.controller('HeaderController', function ($scope, $location) {

    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
});