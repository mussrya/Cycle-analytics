// app.js

var app = angular.module('publicData', ['ui.bootstrap', "ngRoute", 'chart.js']);

app.config(function ($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: '../core/home.html',
        controller: 'publicHome'
    }).
    when('/about', {
        templateUrl: '../core/about.html',
        controller: ''
    }).
    when('/contact', {
        templateUrl: '../core/contact.html',
        controller: ''
    }).
    otherwise({
        redirectTo: '/home'
    });
});