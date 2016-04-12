var myApp = angular.module('myApp');

myApp.factory('AuthService',
    ['$q', '$timeout', '$http',
        function ($q, $timeout, $http) {

            //console.log("Inside Authservice Debugging");
           var user = null;


            function getUserStatus() {
                //return user;
                var deferred = $q.defer();
                // send a get request to the server
                $http.get('/user/status')
                    .success(
                        function (data) {
                            user = {"isloggedIn": true, "data": data}
                            deferred.resolve(user);
                            console.log("Inside Success " + data);
                        })
                    // handle error
                    .error(
                        function (data) {
                            user = {"isloggedIn": false, "data": data.err}
                            deferred.reject(user);
                        });

                // return promise object
                return deferred.promise;
            }

            function login(username, password) {
                console.log("Inside Authservice login");
                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.post('/user/login', {username: username, password: password})
                    // handle success
                    .success(function (data, status) {
                        if (status === 200 && data.status) {
                            user = true;
                            deferred.resolve();
                        } else {
                            user = false;
                            deferred.reject();
                        }
                    })
                    // handle error
                    .error(function (data) {
                        user = false;
                        deferred.reject();
                        console.log(data);
                    });

                // return promise object
                return deferred.promise;

            }

            function logout() {
                console.log("Inside Authservice logout");
                // create a new instance of deferred
                var deferred = $q.defer();

                // send a get request to the server
                $http.get('/user/logout')
                    // handle success
                    .success(function (data) {
                        console.log(data + " Inside success of logout");
                        user = false;
                        deferred.resolve(user);
                    })
                    // handle error
                    .error(function (data) {
                        user = false;
                        deferred.reject(user);
                    });

                // return promise object
                return deferred.promise;

            }

            function isLoggedIn() {
                //console.log("Inside Authservice isloggedIn");
                if (user) {
                    return true;
                } else {
                    return false;
                }
            }

            function register(username, password) {
                console.log("Inside Authservice register");
                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                $http.post('/user/register', {username: username, password: password})
                    // handle success
                    .success(function (data, status) {
                        if (status === 200 && data.status) {
                            deferred.resolve();
                        } else {
                            deferred.reject();
                        }
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject(data);
                        //console.log(data);
                    });

                // return promise object
                return deferred.promise;

            }

            // return available functions for use in controllers
            return ({
                isLoggedIn: isLoggedIn,
                getUserStatus: getUserStatus,
                login: login,
                logout: logout,
                register: register
            });
        }]);

<<<<<<< HEAD
myApp.factory('ApartmentService', ['$q', '$http',function ($q, $http) {
=======
myApp.factory('ApartmentService', ['$q', '$http', function ($q, $http) {
>>>>>>> c4f80b8d5ce9b216fe87a459a01475561a5b2cf2

    console.log('Inside Apartment Service Debugging');

    function getApartments() {
        console.log("Inside Get Apartments Debugging ------->")
        var promise = $q.defer();

        $http.get("/user/getApt")
            .success(function (response, status) {

                if (status != 200)
                    promise.reject(response);


                promise.resolve(response);


            })
            .error(function (response) {
                promise.reject(response);
            });

        // console.log(promise.promise);
        return promise.promise;

    }

    function postApartments(formdata) {
        console.log("Inside Post Apartments Debugging  ------->");

        var promise = $q.defer();
        $http({
            method: 'POST',
            url: '/user/registerApt',
            headers: {
                'Content-Type': undefined
            },
            data: formdata
        })


        //.post('/user/registerApt', formdata,)
            .success(function (response, status) {
                if (status === 200) {
                    promise.resolve(response);
                } else {
                    promise.reject(response);
                }
            })
            .error(function (data) {
                promise.reject(data);

            });

        return promise.promise;
    }

    function deleteApartmentbyId(id)
    {
        var promise=$q.defer();
        $http.delete("/user/deleteApt/"+id)
        .success(function (response)
        {
            promise.resolve(response);
        });

       return promise.promise;
    }

    function findById(id)
    {
        var promise=$q.defer();
        $http.get("/user/getApt/"+id)
            .success(function (response, status) {

                if (status != 200)
                    promise.reject(response);


                promise.resolve(response);


            })
            .error(function (response) {
                promise.reject(response);
            });

        // console.log(promise.promise);
        return promise.promise;

    }

    function updateApartment(id,formdata)
    {
       console.log("Inside Update Apartments Debugging  ------->");

        var promise = $q.defer();
        $http.post('/user/updateApt/'+id,{
            headers: {
                'Content-Type': undefined
            },
            data:formdata
        })  .success(function (response, status) {
                if (status === 200) {
                    promise.resolve(response);
                } else {
                    promise.reject(response);
                }
            })
            .error(function (data) {
                promise.reject(data);

            });

        return promise.promise;
    }

    return (
    {
        postApartments: postApartments,
        getApartments: getApartments,
        deleteApartmentbyId: deleteApartmentbyId,
        findById:findById,
        updateApartment:updateApartment

    }
    );


<<<<<<< HEAD
}])

myApp.factory('AdminService',['$q','$http', '$location',function($q,$http,$location)
{

    function  registerAdmin(username, password)
    {
        console.log("Inside Admin service register");
        var deferred = $q.defer();

        $http.post('user/admin/register', {username: username, password: password})
            .success(function (data) {
                if (data=="Redirect") {
                    $location.path('/admin/login');
                   // deferred.resolve(data);
                } else {
                    deferred.reject();
                }
            })
            .error(function (data) {
                deferred.reject(data);
            });

        return deferred.promise;
    }


    function  loginAdmin(username, password)
    {
        console.log("Inside Admin service login");
        var deferred = $q.defer();

        $http.post('user/admin/login', {username: username, password: password})
            .success(function (data) {
                if (data=="success") {
                    $location.path('/admin/index');

                } else {
                    deferred.reject(data);
                }
            })
            .error(function (data) {
                deferred.reject(data);
            });

        return deferred.promise;
    }


    return(
    {
        registerAdmin:registerAdmin,
        loginAdmin:loginAdmin
    });




=======
>>>>>>> c4f80b8d5ce9b216fe87a459a01475561a5b2cf2
}])