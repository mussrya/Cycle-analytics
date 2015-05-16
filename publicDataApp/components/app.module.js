var app = angular.module('publicData', ['ui.bootstrap', "ngRoute", 'chart.js', 'ngAnimate', 'angulartics', 'angulartics.google.analytics']);

// Handles the default chart configs
app.value('chartDefaults', {
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
    scaleSteps: 20,
    // Number - The value jump in the hard coded scale
    scaleStepWidth: 5,
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
});