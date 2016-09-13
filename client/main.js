var myApp = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngMessages', 'ngFileUpload']);
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
