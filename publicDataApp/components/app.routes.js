app.config(function ($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: 'components/home/home.html',
        controller: 'publicHome'
    }).
    when('/activity', {
        templateUrl: 'components/activity/activity.html',
        controller: ''
    }).
    when('/about', {
        templateUrl: 'components/about/about.html',
        controller: ''
    }).
    when('/contact', {
        templateUrl: 'components/contact/contact.html',
        controller: 'publicContact'
    }).
    when('/station/:stationId', {
        templateUrl: 'components/station/station.html',
        controller: 'stationTrends'
    }).
    otherwise({
        redirectTo: '/home'
    });
});