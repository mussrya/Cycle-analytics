app.config(function ($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: 'components/home/home.html',
        controller: 'publicHome'
    }).
    when('/about', {
        templateUrl: 'components/about/about.html',
        controller: ''
    }).
    when('/contact', {
        templateUrl: 'components/contact/contact.html',
        controller: ''
    }).
    otherwise({
        redirectTo: '/home'
    });
});