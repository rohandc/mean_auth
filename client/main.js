var myApp = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngMessages', 'ngFileUpload', 'rzModule', 'ngAnimate', 'ngSanitize']);
//Do Dependency Injection for plugins here


myApp.config(function ($routeProvider, $locationProvider) {

    $routeProvider
        .when('/',
            {
                templateUrl: 'partials/index.html',
                controller: 'navbarController',
                access: {restricted: false}
            })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'loginController',
            access: {restricted: false}

        })
        .when('/search', {
            templateUrl: 'partials/search.html',
            controller: 'searchController',
            access: {restricted: false}
        })
        .when('/logout', {
            controller: 'logoutController',
            access: {restricted: false}
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'registerController',
            access: {restricted: false}
        })
        .when('/apartmentinfo', {
            templateUrl: 'partials/apartment_info.html',
            controller: 'apartmentController'
        })
        .when('/admin/login',
            {
                templateUrl: 'admin/admin_login.html',
                controller: 'adminLoginController'

            })
        .when('/admin/register',
            {
                templateUrl: 'admin/admin_register.html',
                controller: 'adminRegisterController'

            })
        .when('/admin/index', {
            templateUrl: 'admin/admin_apartmentinfo.html',
            controller: 'adminListController'
        })
        .otherwise({redirectTo: '/'});


});

//Constants

myApp.constant('searchParams', {
    rentType: [
        {id: 0, type: "House"},
        {id: 1, type: "Apartment"},
        {id: 2, type: "Room"},
        {id: 3, type: "Garage"},
        {id: 4, type: "Storage"}],
    price: [
        {id: 0, value: 100},
        {id: 1, value: 200},
        {id: 2, value: 300},
        {id: 3, value: 400},
        {id: 4, value: 500},
        {id: 5, value: 600},
        {id: 6, value: 700},
        {id: 7, value: 800},
        {id: 8, value: 900},
        {id: 9, value: 1000},
        {id: 10, value: 1500}
    ],
    rating: [1, 2, 3, 4, 5],


})


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
