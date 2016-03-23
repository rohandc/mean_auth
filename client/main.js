/// <reference path="../Scripts/typings/tsd.d.ts" />

var myApp = angular.module('myApp', ['ngRoute','ui.bootstrap','ngMessages']);
//Do Dependency Injection for plugins here


myApp.config(function ($routeProvider, $locationProvider) {



    $routeProvider
    .when('/', { templateUrl: 'partials/index.html',
                 controller:'navbarController',
                 access: { restricted: false }
                })
    .when('/login', {
        templateUrl: 'partials/login.html', 
        controller: 'loginController',
        access: { restricted: false }
        
    })
    .when('/logout', {
        controller: 'logoutController',
        access: { restricted: false }
    })
    .when('/register', {
        templateUrl: 'partials/register.html', 
        controller: 'registerController',
        access: { restricted: false }
    })
    .when('/apartmentinfo', {
        templateUrl: 'partials/apartment_info.html',
        controller: 'apartmentController'
     })
    .when('/one', { template: '<h1>This is page one!</h1>' })
    .when('/two', { template: '<h1>This is page two!</h1>' })
    .otherwise({ redirectTo: '/' });


});


//tracking route session

/*
myApp.run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event,next,current)
    {
        AuthService.getUserStatus();
        if (next.access.restricted && !AuthService.getUserStatus()) {
            $location.path('/');
            $route.reload();
        }
    });
});

*/
