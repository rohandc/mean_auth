//Login Controller

var myApp = angular.module('myApp');


angular.module('myApp').controller('loginController',
    ['$scope', '$location', 'AuthService',
        function ($scope, $location, AuthService) {


         
            $scope.login = function () {

                // initial values
                $scope.error = false;
                $scope.disabled = true;

                // call login from service
                AuthService.login($scope.loginForm.username, $scope.loginForm.password)
                // handle success
                    .then(function () {
                        $location.path('/');
                        $scope.disabled = false;
                        $scope.loginForm = {};
                    })
                    // handle error
                    .catch(function () {
                        $scope.error = true;
                        $scope.errorMessage = "Invalid username and/or password";
                        $scope.disabled = false;
                        $scope.loginForm = {};
                    });

            };

        }]);

//LogOut Controller
myApp.controller('logoutController',
    ['$scope', '$location', 'AuthService,$log',
        function ($scope, $location, AuthService) {

            $scope.isLoggedIn = AuthService.isLoggedIn;

            $scope.logout = function () {

                // $log.info(AuthService.getUserStatus());
                // call logout from service
                AuthService.logout()
                    .then(function (data) {

                        alert(data);
                        $location.path('user/login');
                    });

            };

        }]);

//Register Controller
myApp.controller('registerController',
    ['$scope', '$location', 'AuthService',
        function ($scope, $location, AuthService) {

            console.log(AuthService.getUserStatus());
            $scope.register = function () {

                // initial values
                $scope.error = false;
                $scope.disabled = true;
                // call register from service
                AuthService.register($scope.formData.username, $scope.formData.password)
                // handle success
                    .then(function () {
                        console.log("Success inside register Controller");
                        $location.path('/user/login');
                    })
                    // handle error
                    .catch(function (err) {
                        //console.log(err);
                        $scope.iserror = true;
                        $scope.error = err;//"Something went wrong!";
                        $scope.disabled = false;
                        $scope.registerForm = {};
                    });

            };

        }])
    .directive('validPasswordC', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue, $scope) {
                    var noMatch = viewValue != scope.myForm.password.$viewValue
                    ctrl.$setValidity('noMatch', !noMatch)
                    return viewValue;
                })
            }
        }
    });

//Controller for Searching Apartments and Displaying Login Status
myApp.controller('navbarController', ['$scope', '$location', 'AuthService', 'SearchService',
    function ($scope, $location, AuthService, SearchService) {


        var data = {};
        var promise = AuthService.getUserStatus();
        promise.then(function (response) {
            console.log(response);
            console.log(response.data);
            if (response.isloggedIn) {
                $scope.isloggedIn = response.isloggedIn;
                $scope.username = "Welcome " + response.data.username;
            }
            else {
                $scope.isloggedIn = response.isloggedIn;

            }


        }).catch(function (err) {
            console.log(err);
        });
        $scope.search = function () {
            var query = {}
            query.searchText = $scope.searchtext || 'Toronto';
            query.rentType = $scope.rentType || 'Apartment';
            query.minPrice = $scope.minPrice || 0;
            query.maxPrice = $scope.maxPrice || 2000;
            query.duration = $scope.duration || 24;
            query.rating = $scope.rating || 5;
            SearchService.getLocalResults(query);

        }
    }]);

myApp.controller('searchController', ['$scope', function ($scope) {


    $scope.slider = {
        minValue: 100,
        maxValue: 2000,
        options: {
            floor: 0,
            ceil: 2000,
            step: 1
        }
    };


}]);

//Controller for Apartment CRUD Operations
myApp.controller('apartmentController', ['$scope', 'ApartmentService', 'UploadService', '$uibModal', '$log', '$anchorScroll', '$location', '$route',
    function ($scope, ApartmentService, UploadService, $uibModal, $log, $anchorScroll, $location, $route) {
        //SPA scrolling to different location
        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        }

        //Get Part of Apartments
        $scope.initialize = function () {
            //Initialize Apartments
            ApartmentService.getApartments()
                .then(function (response) {
                    $scope.apartments = response;
                });

            //Initialize User
            ApartmentService.getcurrentUser()
                .then(function (response) {
                    $scope.profile = response;
                });

        }

        $scope.reset = function () {
            $scope.apt.name = "";
            $scope.apt.apartment_no = "";
            $scope.apt.street_name = "";
            $scope.apt.city = "";
            $scope.apt.postal_code = "";
            $scope.apt.country = "  ";
            $scope.apt.rental_type = "";
            $scope.apt.author = "";
            $scope.apt.duration = "";
            $scope.apt.occupants_no = "";
            $scope.apartment.$setPristine();
            $scope.apartment.$setUntouched();


        }

        $scope.initialize();

        $scope.editapt = function (id) {

            //Modal Start

            //Fetch edit Data

            ApartmentService.findById(id)
                .then(function (response) {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: '/partials/templates/modal.html',
                        controller: 'ModalInstanceCtrl',
                        size: 'lg',
                        resolve: {
                            apt: function () {
                                return response
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
                });


            $scope.toggleAnimation = function () {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };

            //Modal End

        }

        $scope.deleteapt = function (id) {
            swal(
                {
                    title: "Are you sure?",
                    text: "You will not be able to recover this file!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "No, cancel plz!",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function (isConfirm) {
                    if (isConfirm) {
                        ApartmentService.deleteApartmentbyId(id)
                            .then(function (response) {
                                swal({title: response.message, type: "success"}, function (isConfirm) {
                                    $scope.initialize();
                                });

                            });
                    }
                    else {
                        swal("Cancelled", "Your File is safe :)", "error");
                    }

                });


        }


        //End of Get Part


        //Post Part of Apartments

        //For filling list of Countries
        $scope.countries = [
            {name: 'Afghanistan', code: 'AF'},
            {name: 'Åland Islands', code: 'AX'},
            {name: 'Albania', code: 'AL'},
            {name: 'Algeria', code: 'DZ'},
            {name: 'American Samoa', code: 'AS'},
            {name: 'Andorra', code: 'AD'},
            {name: 'Angola', code: 'AO'},
            {name: 'Anguilla', code: 'AI'},
            {name: 'Antarctica', code: 'AQ'},
            {name: 'Antigua and Barbuda', code: 'AG'},
            {name: 'Argentina', code: 'AR'},
            {name: 'Armenia', code: 'AM'},
            {name: 'Aruba', code: 'AW'},
            {name: 'Australia', code: 'AU'},
            {name: 'Austria', code: 'AT'},
            {name: 'Azerbaijan', code: 'AZ'},
            {name: 'Bahamas', code: 'BS'},
            {name: 'Bahrain', code: 'BH'},
            {name: 'Bangladesh', code: 'BD'},
            {name: 'Barbados', code: 'BB'},
            {name: 'Belarus', code: 'BY'},
            {name: 'Belgium', code: 'BE'},
            {name: 'Belize', code: 'BZ'},
            {name: 'Benin', code: 'BJ'},
            {name: 'Bermuda', code: 'BM'},
            {name: 'Bhutan', code: 'BT'},
            {name: 'Bolivia', code: 'BO'},
            {name: 'Bosnia and Herzegovina', code: 'BA'},
            {name: 'Botswana', code: 'BW'},
            {name: 'Bouvet Island', code: 'BV'},
            {name: 'Brazil', code: 'BR'},
            {name: 'British Indian Ocean Territory', code: 'IO'},
            {name: 'Brunei Darussalam', code: 'BN'},
            {name: 'Bulgaria', code: 'BG'},
            {name: 'Burkina Faso', code: 'BF'},
            {name: 'Burundi', code: 'BI'},
            {name: 'Cambodia', code: 'KH'},
            {name: 'Cameroon', code: 'CM'},
            {name: 'Canada', code: 'CA'},
            {name: 'Cape Verde', code: 'CV'},
            {name: 'Cayman Islands', code: 'KY'},
            {name: 'Central African Republic', code: 'CF'},
            {name: 'Chad', code: 'TD'},
            {name: 'Chile', code: 'CL'},
            {name: 'China', code: 'CN'},
            {name: 'Christmas Island', code: 'CX'},
            {name: 'Cocos (Keeling) Islands', code: 'CC'},
            {name: 'Colombia', code: 'CO'},
            {name: 'Comoros', code: 'KM'},
            {name: 'Congo', code: 'CG'},
            {name: 'Congo, The Democratic Republic of the', code: 'CD'},
            {name: 'Cook Islands', code: 'CK'},
            {name: 'Costa Rica', code: 'CR'},
            {name: 'Cote D\'Ivoire', code: 'CI'},
            {name: 'Croatia', code: 'HR'},
            {name: 'Cuba', code: 'CU'},
            {name: 'Cyprus', code: 'CY'},
            {name: 'Czech Republic', code: 'CZ'},
            {name: 'Denmark', code: 'DK'},
            {name: 'Djibouti', code: 'DJ'},
            {name: 'Dominica', code: 'DM'},
            {name: 'Dominican Republic', code: 'DO'},
            {name: 'Ecuador', code: 'EC'},
            {name: 'Egypt', code: 'EG'},
            {name: 'El Salvador', code: 'SV'},
            {name: 'Equatorial Guinea', code: 'GQ'},
            {name: 'Eritrea', code: 'ER'},
            {name: 'Estonia', code: 'EE'},
            {name: 'Ethiopia', code: 'ET'},
            {name: 'Falkland Islands (Malvinas)', code: 'FK'},
            {name: 'Faroe Islands', code: 'FO'},
            {name: 'Fiji', code: 'FJ'},
            {name: 'Finland', code: 'FI'},
            {name: 'France', code: 'FR'},
            {name: 'French Guiana', code: 'GF'},
            {name: 'French Polynesia', code: 'PF'},
            {name: 'French Southern Territories', code: 'TF'},
            {name: 'Gabon', code: 'GA'},
            {name: 'Gambia', code: 'GM'},
            {name: 'Georgia', code: 'GE'},
            {name: 'Germany', code: 'DE'},
            {name: 'Ghana', code: 'GH'},
            {name: 'Gibraltar', code: 'GI'},
            {name: 'Greece', code: 'GR'},
            {name: 'Greenland', code: 'GL'},
            {name: 'Grenada', code: 'GD'},
            {name: 'Guadeloupe', code: 'GP'},
            {name: 'Guam', code: 'GU'},
            {name: 'Guatemala', code: 'GT'},
            {name: 'Guernsey', code: 'GG'},
            {name: 'Guinea', code: 'GN'},
            {name: 'Guinea-Bissau', code: 'GW'},
            {name: 'Guyana', code: 'GY'},
            {name: 'Haiti', code: 'HT'},
            {name: 'Heard Island and Mcdonald Islands', code: 'HM'},
            {name: 'Holy See (Vatican City State)', code: 'VA'},
            {name: 'Honduras', code: 'HN'},
            {name: 'Hong Kong', code: 'HK'},
            {name: 'Hungary', code: 'HU'},
            {name: 'Iceland', code: 'IS'},
            {name: 'India', code: 'IN'},
            {name: 'Indonesia', code: 'ID'},
            {name: 'Iran, Islamic Republic Of', code: 'IR'},
            {name: 'Iraq', code: 'IQ'},
            {name: 'Ireland', code: 'IE'},
            {name: 'Isle of Man', code: 'IM'},
            {name: 'Israel', code: 'IL'},
            {name: 'Italy', code: 'IT'},
            {name: 'Jamaica', code: 'JM'},
            {name: 'Japan', code: 'JP'},
            {name: 'Jersey', code: 'JE'},
            {name: 'Jordan', code: 'JO'},
            {name: 'Kazakhstan', code: 'KZ'},
            {name: 'Kenya', code: 'KE'},
            {name: 'Kiribati', code: 'KI'},
            {name: 'Korea, Democratic People\'s Republic of', code: 'KP'},
            {name: 'Korea, Republic of', code: 'KR'},
            {name: 'Kuwait', code: 'KW'},
            {name: 'Kyrgyzstan', code: 'KG'},
            {name: 'Lao People\'s Democratic Republic', code: 'LA'},
            {name: 'Latvia', code: 'LV'},
            {name: 'Lebanon', code: 'LB'},
            {name: 'Lesotho', code: 'LS'},
            {name: 'Liberia', code: 'LR'},
            {name: 'Libyan Arab Jamahiriya', code: 'LY'},
            {name: 'Liechtenstein', code: 'LI'},
            {name: 'Lithuania', code: 'LT'},
            {name: 'Luxembourg', code: 'LU'},
            {name: 'Macao', code: 'MO'},
            {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'},
            {name: 'Madagascar', code: 'MG'},
            {name: 'Malawi', code: 'MW'},
            {name: 'Malaysia', code: 'MY'},
            {name: 'Maldives', code: 'MV'},
            {name: 'Mali', code: 'ML'},
            {name: 'Malta', code: 'MT'},
            {name: 'Marshall Islands', code: 'MH'},
            {name: 'Martinique', code: 'MQ'},
            {name: 'Mauritania', code: 'MR'},
            {name: 'Mauritius', code: 'MU'},
            {name: 'Mayotte', code: 'YT'},
            {name: 'Mexico', code: 'MX'},
            {name: 'Micronesia, Federated States of', code: 'FM'},
            {name: 'Moldova, Republic of', code: 'MD'},
            {name: 'Monaco', code: 'MC'},
            {name: 'Mongolia', code: 'MN'},
            {name: 'Montserrat', code: 'MS'},
            {name: 'Morocco', code: 'MA'},
            {name: 'Mozambique', code: 'MZ'},
            {name: 'Myanmar', code: 'MM'},
            {name: 'Namibia', code: 'NA'},
            {name: 'Nauru', code: 'NR'},
            {name: 'Nepal', code: 'NP'},
            {name: 'Netherlands', code: 'NL'},
            {name: 'Netherlands Antilles', code: 'AN'},
            {name: 'New Caledonia', code: 'NC'},
            {name: 'New Zealand', code: 'NZ'},
            {name: 'Nicaragua', code: 'NI'},
            {name: 'Niger', code: 'NE'},
            {name: 'Nigeria', code: 'NG'},
            {name: 'Niue', code: 'NU'},
            {name: 'Norfolk Island', code: 'NF'},
            {name: 'Northern Mariana Islands', code: 'MP'},
            {name: 'Norway', code: 'NO'},
            {name: 'Oman', code: 'OM'},
            {name: 'Pakistan', code: 'PK'},
            {name: 'Palau', code: 'PW'},
            {name: 'Palestinian Territory, Occupied', code: 'PS'},
            {name: 'Panama', code: 'PA'},
            {name: 'Papua New Guinea', code: 'PG'},
            {name: 'Paraguay', code: 'PY'},
            {name: 'Peru', code: 'PE'},
            {name: 'Philippines', code: 'PH'},
            {name: 'Pitcairn', code: 'PN'},
            {name: 'Poland', code: 'PL'},
            {name: 'Portugal', code: 'PT'},
            {name: 'Puerto Rico', code: 'PR'},
            {name: 'Qatar', code: 'QA'},
            {name: 'Reunion', code: 'RE'},
            {name: 'Romania', code: 'RO'},
            {name: 'Russian Federation', code: 'RU'},
            {name: 'Rwanda', code: 'RW'},
            {name: 'Saint Helena', code: 'SH'},
            {name: 'Saint Kitts and Nevis', code: 'KN'},
            {name: 'Saint Lucia', code: 'LC'},
            {name: 'Saint Pierre and Miquelon', code: 'PM'},
            {name: 'Saint Vincent and the Grenadines', code: 'VC'},
            {name: 'Samoa', code: 'WS'},
            {name: 'San Marino', code: 'SM'},
            {name: 'Sao Tome and Principe', code: 'ST'},
            {name: 'Saudi Arabia', code: 'SA'},
            {name: 'Senegal', code: 'SN'},
            {name: 'Serbia and Montenegro', code: 'CS'},
            {name: 'Seychelles', code: 'SC'},
            {name: 'Sierra Leone', code: 'SL'},
            {name: 'Singapore', code: 'SG'},
            {name: 'Slovakia', code: 'SK'},
            {name: 'Slovenia', code: 'SI'},
            {name: 'Solomon Islands', code: 'SB'},
            {name: 'Somalia', code: 'SO'},
            {name: 'South Africa', code: 'ZA'},
            {name: 'South Georgia and the South Sandwich Islands', code: 'GS'},
            {name: 'Spain', code: 'ES'},
            {name: 'Sri Lanka', code: 'LK'},
            {name: 'Sudan', code: 'SD'},
            {name: 'Suriname', code: 'SR'},
            {name: 'Svalbard and Jan Mayen', code: 'SJ'},
            {name: 'Swaziland', code: 'SZ'},
            {name: 'Sweden', code: 'SE'},
            {name: 'Switzerland', code: 'CH'},
            {name: 'Syrian Arab Republic', code: 'SY'},
            {name: 'Taiwan, Province of China', code: 'TW'},
            {name: 'Tajikistan', code: 'TJ'},
            {name: 'Tanzania, United Republic of', code: 'TZ'},
            {name: 'Thailand', code: 'TH'},
            {name: 'Timor-Leste', code: 'TL'},
            {name: 'Togo', code: 'TG'},
            {name: 'Tokelau', code: 'TK'},
            {name: 'Tonga', code: 'TO'},
            {name: 'Trinidad and Tobago', code: 'TT'},
            {name: 'Tunisia', code: 'TN'},
            {name: 'Turkey', code: 'TR'},
            {name: 'Turkmenistan', code: 'TM'},
            {name: 'Turks and Caicos Islands', code: 'TC'},
            {name: 'Tuvalu', code: 'TV'},
            {name: 'Uganda', code: 'UG'},
            {name: 'Ukraine', code: 'UA'},
            {name: 'United Arab Emirates', code: 'AE'},
            {name: 'United Kingdom', code: 'GB'},
            {name: 'United States', code: 'US'},
            {name: 'United States Minor Outlying Islands', code: 'UM'},
            {name: 'Uruguay', code: 'UY'},
            {name: 'Uzbekistan', code: 'UZ'},
            {name: 'Vanuatu', code: 'VU'},
            {name: 'Venezuela', code: 'VE'},
            {name: 'Vietnam', code: 'VN'},
            {name: 'Virgin Islands, British', code: 'VG'},
            {name: 'Virgin Islands, U.S.', code: 'VI'},
            {name: 'Wallis and Futuna', code: 'WF'},
            {name: 'Western Sahara', code: 'EH'},
            {name: 'Yemen', code: 'YE'},
            {name: 'Zambia', code: 'ZM'},
            {name: 'Zimbabwe', code: 'ZW'}
        ];
        //End of List
        //Image Upload functionality

        $scope.imagearray = [];

        //Function to Capture Image as soon as image is selected
        $scope.fileSelected = function () {

            var files = $("#imagebox").get(0).files;
            var target = $('#imgReview');
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var imageType = /image.*/;
                var reader = new FileReader();
                if (file.type.match(imageType)) {

                    reader.readAsDataURL(file);
                    reader.addEventListener("load", function (e) {
                        console.log(e);
                        var img = $('<img  />', {
                            src: e.target.result,
                            class: "imageThumb",
                            name: file.name,
                            onClick: "angular.element(this).scope().delete(this)"
                        });
                        target.append(img);
                    }, false);

                    $scope.imagearray.push(file);
                }
                else {
                    console.error("File not Supported")
                }
            }

            //console.log($scope.imagearray);
        }


        $scope.delete = function (input) {

            $("img[name='" + input.name + "']").remove();
            for (var i = 0; i < $scope.imagearray.length; i++) {
                if ($scope.imagearray[i].name == input.name) {
                    $scope.imagearray.splice(i, 1);
                }
            }
            console.log($scope.imagearray);
        }

        //End of Image Upload
        $scope.addApartment = function () {
            var formdata = new FormData();
            formdata.append("name", $scope.apt.name);
            formdata.append("apartment_no", $scope.apt.apartment_no);
            formdata.append("street_name", $scope.apt.street_name);
            formdata.append("city", $scope.apt.city);
            formdata.append("postal_code", $scope.apt.postal_code);
            formdata.append("country", $scope.apt.country);
            formdata.append("rental_type", $scope.apt.rental_type);
            formdata.append("author", $scope.apt.author);
            formdata.append("price", 666.66);
            formdata.append("duration", $scope.apt.duration);
            formdata.append("occupants_no", $scope.apt.occupants_no);
            formdata.append("description", "");
            formdata.append("rank", 7);


            for (var i = 0; i < $scope.imagearray.length; i++) {
                formdata.append('files' + i, $scope.imagearray[i]);
            }

            ApartmentService.postApartments(formdata).then(function (success) {
                $scope.imagearray = [];
                $scope.reset();
                $scope.initialize();
            });

        }

        $scope.$on("updateApartment", function () {

            $scope.initialize();
            $scope.apartment.name = "";
            $scope.apartment.apartment_no = "";
            $scope.apartment.street_name = "";
            $scope.apartment.city = "";
            $scope.apartment.postal_code = "";
            $scope.apartment.country = "  ";
            $scope.apartment.rental_type = "";
            $scope.apartment.author = "";
            $scope.apartment.duration = "";
            $scope.apartment.occupants_no = "";
            $scope.apartment.$setPristine();
            $scope.apartment.$setUntouched();

        });

        //Angular file upload for profile picture

        $scope.uploadComplete = function () {
            var data = new FormData();
            data.username = $scope.profile.username;
            data.email = $scope.profile.email;
            data.first_name = $scope.profile.first_name;
            data.last_name = $scope.profile.last_name;
            data.gender = $scope.profile.gender;
            data.contact_number = $scope.profile.contact_number;

            UploadService.uploadfile($scope.files, data, '/user/profileUpdate',
                function (msg) // success
                {
                    console.log('uploaded' + msg);
                    $scope.initialize();
                },
                function (msg) // error
                {
                    console.log('error');
                });
        }

        $scope.uploadedFile = function (element) {
            $scope.$apply(function ($scope) {
                $scope.files = element.files;

                var target = $('#profile_img');

                var file = $scope.files[0];
                var imageType = /image.*/;
                var reader = new FileReader();
                if (file.type.match(imageType)) {
                    reader.readAsDataURL(file);
                    reader.addEventListener("load", function (e) {
                        console.log(e);
                        var img = $('<img  />', {
                            src: e.target.result,
                            class: "imageThumb",
                            name: file.name,
                            onClick: "angular.element(this).scope().delete_profile(this)"
                        });
                        target.append(img);
                    }, false);
                }
                else {
                    console.error("File not Supported")
                }


            });
        }

        $scope.delete_profile = function (input) {

            $("img[name='" + input.name + "']").remove();
            $scope.files = null;
            $("#profile_image").val("");
            console.log($scope.files);
        }

    }]);

//Controller to edit/update data for Modal PopUp
myApp.controller('ModalInstanceCtrl', function (ApartmentService, $rootScope, $scope, $uibModalInstance, apt, $http) {
    var formdata = new FormData();

    //Array Containing FIle list to be Deleted
    $scope.image_delete = [];

    //For filling list of Countries
    $scope.countries = [
        {name: 'Afghanistan', code: 'AF'},
        {name: 'Åland Islands', code: 'AX'},
        {name: 'Albania', code: 'AL'},
        {name: 'Algeria', code: 'DZ'},
        {name: 'American Samoa', code: 'AS'},
        {name: 'Andorra', code: 'AD'},
        {name: 'Angola', code: 'AO'},
        {name: 'Anguilla', code: 'AI'},
        {name: 'Antarctica', code: 'AQ'},
        {name: 'Antigua and Barbuda', code: 'AG'},
        {name: 'Argentina', code: 'AR'},
        {name: 'Armenia', code: 'AM'},
        {name: 'Aruba', code: 'AW'},
        {name: 'Australia', code: 'AU'},
        {name: 'Austria', code: 'AT'},
        {name: 'Azerbaijan', code: 'AZ'},
        {name: 'Bahamas', code: 'BS'},
        {name: 'Bahrain', code: 'BH'},
        {name: 'Bangladesh', code: 'BD'},
        {name: 'Barbados', code: 'BB'},
        {name: 'Belarus', code: 'BY'},
        {name: 'Belgium', code: 'BE'},
        {name: 'Belize', code: 'BZ'},
        {name: 'Benin', code: 'BJ'},
        {name: 'Bermuda', code: 'BM'},
        {name: 'Bhutan', code: 'BT'},
        {name: 'Bolivia', code: 'BO'},
        {name: 'Bosnia and Herzegovina', code: 'BA'},
        {name: 'Botswana', code: 'BW'},
        {name: 'Bouvet Island', code: 'BV'},
        {name: 'Brazil', code: 'BR'},
        {name: 'British Indian Ocean Territory', code: 'IO'},
        {name: 'Brunei Darussalam', code: 'BN'},
        {name: 'Bulgaria', code: 'BG'},
        {name: 'Burkina Faso', code: 'BF'},
        {name: 'Burundi', code: 'BI'},
        {name: 'Cambodia', code: 'KH'},
        {name: 'Cameroon', code: 'CM'},
        {name: 'Canada', code: 'CA'},
        {name: 'Cape Verde', code: 'CV'},
        {name: 'Cayman Islands', code: 'KY'},
        {name: 'Central African Republic', code: 'CF'},
        {name: 'Chad', code: 'TD'},
        {name: 'Chile', code: 'CL'},
        {name: 'China', code: 'CN'},
        {name: 'Christmas Island', code: 'CX'},
        {name: 'Cocos (Keeling) Islands', code: 'CC'},
        {name: 'Colombia', code: 'CO'},
        {name: 'Comoros', code: 'KM'},
        {name: 'Congo', code: 'CG'},
        {name: 'Congo, The Democratic Republic of the', code: 'CD'},
        {name: 'Cook Islands', code: 'CK'},
        {name: 'Costa Rica', code: 'CR'},
        {name: 'Cote D\'Ivoire', code: 'CI'},
        {name: 'Croatia', code: 'HR'},
        {name: 'Cuba', code: 'CU'},
        {name: 'Cyprus', code: 'CY'},
        {name: 'Czech Republic', code: 'CZ'},
        {name: 'Denmark', code: 'DK'},
        {name: 'Djibouti', code: 'DJ'},
        {name: 'Dominica', code: 'DM'},
        {name: 'Dominican Republic', code: 'DO'},
        {name: 'Ecuador', code: 'EC'},
        {name: 'Egypt', code: 'EG'},
        {name: 'El Salvador', code: 'SV'},
        {name: 'Equatorial Guinea', code: 'GQ'},
        {name: 'Eritrea', code: 'ER'},
        {name: 'Estonia', code: 'EE'},
        {name: 'Ethiopia', code: 'ET'},
        {name: 'Falkland Islands (Malvinas)', code: 'FK'},
        {name: 'Faroe Islands', code: 'FO'},
        {name: 'Fiji', code: 'FJ'},
        {name: 'Finland', code: 'FI'},
        {name: 'France', code: 'FR'},
        {name: 'French Guiana', code: 'GF'},
        {name: 'French Polynesia', code: 'PF'},
        {name: 'French Southern Territories', code: 'TF'},
        {name: 'Gabon', code: 'GA'},
        {name: 'Gambia', code: 'GM'},
        {name: 'Georgia', code: 'GE'},
        {name: 'Germany', code: 'DE'},
        {name: 'Ghana', code: 'GH'},
        {name: 'Gibraltar', code: 'GI'},
        {name: 'Greece', code: 'GR'},
        {name: 'Greenland', code: 'GL'},
        {name: 'Grenada', code: 'GD'},
        {name: 'Guadeloupe', code: 'GP'},
        {name: 'Guam', code: 'GU'},
        {name: 'Guatemala', code: 'GT'},
        {name: 'Guernsey', code: 'GG'},
        {name: 'Guinea', code: 'GN'},
        {name: 'Guinea-Bissau', code: 'GW'},
        {name: 'Guyana', code: 'GY'},
        {name: 'Haiti', code: 'HT'},
        {name: 'Heard Island and Mcdonald Islands', code: 'HM'},
        {name: 'Holy See (Vatican City State)', code: 'VA'},
        {name: 'Honduras', code: 'HN'},
        {name: 'Hong Kong', code: 'HK'},
        {name: 'Hungary', code: 'HU'},
        {name: 'Iceland', code: 'IS'},
        {name: 'India', code: 'IN'},
        {name: 'Indonesia', code: 'ID'},
        {name: 'Iran, Islamic Republic Of', code: 'IR'},
        {name: 'Iraq', code: 'IQ'},
        {name: 'Ireland', code: 'IE'},
        {name: 'Isle of Man', code: 'IM'},
        {name: 'Israel', code: 'IL'},
        {name: 'Italy', code: 'IT'},
        {name: 'Jamaica', code: 'JM'},
        {name: 'Japan', code: 'JP'},
        {name: 'Jersey', code: 'JE'},
        {name: 'Jordan', code: 'JO'},
        {name: 'Kazakhstan', code: 'KZ'},
        {name: 'Kenya', code: 'KE'},
        {name: 'Kiribati', code: 'KI'},
        {name: 'Korea, Democratic People\'s Republic of', code: 'KP'},
        {name: 'Korea, Republic of', code: 'KR'},
        {name: 'Kuwait', code: 'KW'},
        {name: 'Kyrgyzstan', code: 'KG'},
        {name: 'Lao People\'s Democratic Republic', code: 'LA'},
        {name: 'Latvia', code: 'LV'},
        {name: 'Lebanon', code: 'LB'},
        {name: 'Lesotho', code: 'LS'},
        {name: 'Liberia', code: 'LR'},
        {name: 'Libyan Arab Jamahiriya', code: 'LY'},
        {name: 'Liechtenstein', code: 'LI'},
        {name: 'Lithuania', code: 'LT'},
        {name: 'Luxembourg', code: 'LU'},
        {name: 'Macao', code: 'MO'},
        {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'},
        {name: 'Madagascar', code: 'MG'},
        {name: 'Malawi', code: 'MW'},
        {name: 'Malaysia', code: 'MY'},
        {name: 'Maldives', code: 'MV'},
        {name: 'Mali', code: 'ML'},
        {name: 'Malta', code: 'MT'},
        {name: 'Marshall Islands', code: 'MH'},
        {name: 'Martinique', code: 'MQ'},
        {name: 'Mauritania', code: 'MR'},
        {name: 'Mauritius', code: 'MU'},
        {name: 'Mayotte', code: 'YT'},
        {name: 'Mexico', code: 'MX'},
        {name: 'Micronesia, Federated States of', code: 'FM'},
        {name: 'Moldova, Republic of', code: 'MD'},
        {name: 'Monaco', code: 'MC'},
        {name: 'Mongolia', code: 'MN'},
        {name: 'Montserrat', code: 'MS'},
        {name: 'Morocco', code: 'MA'},
        {name: 'Mozambique', code: 'MZ'},
        {name: 'Myanmar', code: 'MM'},
        {name: 'Namibia', code: 'NA'},
        {name: 'Nauru', code: 'NR'},
        {name: 'Nepal', code: 'NP'},
        {name: 'Netherlands', code: 'NL'},
        {name: 'Netherlands Antilles', code: 'AN'},
        {name: 'New Caledonia', code: 'NC'},
        {name: 'New Zealand', code: 'NZ'},
        {name: 'Nicaragua', code: 'NI'},
        {name: 'Niger', code: 'NE'},
        {name: 'Nigeria', code: 'NG'},
        {name: 'Niue', code: 'NU'},
        {name: 'Norfolk Island', code: 'NF'},
        {name: 'Northern Mariana Islands', code: 'MP'},
        {name: 'Norway', code: 'NO'},
        {name: 'Oman', code: 'OM'},
        {name: 'Pakistan', code: 'PK'},
        {name: 'Palau', code: 'PW'},
        {name: 'Palestinian Territory, Occupied', code: 'PS'},
        {name: 'Panama', code: 'PA'},
        {name: 'Papua New Guinea', code: 'PG'},
        {name: 'Paraguay', code: 'PY'},
        {name: 'Peru', code: 'PE'},
        {name: 'Philippines', code: 'PH'},
        {name: 'Pitcairn', code: 'PN'},
        {name: 'Poland', code: 'PL'},
        {name: 'Portugal', code: 'PT'},
        {name: 'Puerto Rico', code: 'PR'},
        {name: 'Qatar', code: 'QA'},
        {name: 'Reunion', code: 'RE'},
        {name: 'Romania', code: 'RO'},
        {name: 'Russian Federation', code: 'RU'},
        {name: 'Rwanda', code: 'RW'},
        {name: 'Saint Helena', code: 'SH'},
        {name: 'Saint Kitts and Nevis', code: 'KN'},
        {name: 'Saint Lucia', code: 'LC'},
        {name: 'Saint Pierre and Miquelon', code: 'PM'},
        {name: 'Saint Vincent and the Grenadines', code: 'VC'},
        {name: 'Samoa', code: 'WS'},
        {name: 'San Marino', code: 'SM'},
        {name: 'Sao Tome and Principe', code: 'ST'},
        {name: 'Saudi Arabia', code: 'SA'},
        {name: 'Senegal', code: 'SN'},
        {name: 'Serbia and Montenegro', code: 'CS'},
        {name: 'Seychelles', code: 'SC'},
        {name: 'Sierra Leone', code: 'SL'},
        {name: 'Singapore', code: 'SG'},
        {name: 'Slovakia', code: 'SK'},
        {name: 'Slovenia', code: 'SI'},
        {name: 'Solomon Islands', code: 'SB'},
        {name: 'Somalia', code: 'SO'},
        {name: 'South Africa', code: 'ZA'},
        {name: 'South Georgia and the South Sandwich Islands', code: 'GS'},
        {name: 'Spain', code: 'ES'},
        {name: 'Sri Lanka', code: 'LK'},
        {name: 'Sudan', code: 'SD'},
        {name: 'Suriname', code: 'SR'},
        {name: 'Svalbard and Jan Mayen', code: 'SJ'},
        {name: 'Swaziland', code: 'SZ'},
        {name: 'Sweden', code: 'SE'},
        {name: 'Switzerland', code: 'CH'},
        {name: 'Syrian Arab Republic', code: 'SY'},
        {name: 'Taiwan, Province of China', code: 'TW'},
        {name: 'Tajikistan', code: 'TJ'},
        {name: 'Tanzania, United Republic of', code: 'TZ'},
        {name: 'Thailand', code: 'TH'},
        {name: 'Timor-Leste', code: 'TL'},
        {name: 'Togo', code: 'TG'},
        {name: 'Tokelau', code: 'TK'},
        {name: 'Tonga', code: 'TO'},
        {name: 'Trinidad and Tobago', code: 'TT'},
        {name: 'Tunisia', code: 'TN'},
        {name: 'Turkey', code: 'TR'},
        {name: 'Turkmenistan', code: 'TM'},
        {name: 'Turks and Caicos Islands', code: 'TC'},
        {name: 'Tuvalu', code: 'TV'},
        {name: 'Uganda', code: 'UG'},
        {name: 'Ukraine', code: 'UA'},
        {name: 'United Arab Emirates', code: 'AE'},
        {name: 'United Kingdom', code: 'GB'},
        {name: 'United States', code: 'US'},
        {name: 'United States Minor Outlying Islands', code: 'UM'},
        {name: 'Uruguay', code: 'UY'},
        {name: 'Uzbekistan', code: 'UZ'},
        {name: 'Vanuatu', code: 'VU'},
        {name: 'Venezuela', code: 'VE'},
        {name: 'Vietnam', code: 'VN'},
        {name: 'Virgin Islands, British', code: 'VG'},
        {name: 'Virgin Islands, U.S.', code: 'VI'},
        {name: 'Wallis and Futuna', code: 'WF'},
        {name: 'Western Sahara', code: 'EH'},
        {name: 'Yemen', code: 'YE'},
        {name: 'Zambia', code: 'ZM'},
        {name: 'Zimbabwe', code: 'ZW'}
    ];

    //End of List

    //Variable for fail safe if no images exist from Database
    $scope.isSuccessful = false;
    $scope.apt = apt;
    $scope.imageLocations = [];

    $scope.imagearray = [];
    $scope.imageExist = false;
    if (apt.files != undefined || apt.files) {
        $scope.imageExist = true;
        apt.files.forEach(function (file) {
            var element = {};
            element.id = file.id;
            element.value = "partials/images/uploads/" + file.name;
            $scope.imageLocations.push(element);
        });

    }

    /* $scope.fileSelected = function () {
     var files = $("#modal_imagebox").get(0).files;
     var target = $('#modal_popup_imgReview');
     for (var i = 0; i < files.length; i++) {
     var file = files[i];
     var imageType = /image.*!/;
     var reader = new FileReader();
     if (file.type.match(imageType)) {

     reader.readAsDataURL(file);
     reader.addEventListener("load", function (e) {
     console.log(e);
     var img = $('<img  />', {
     src: e.target.result,
     class: "imageThumb",
     name: file.name,
     onClick: "angular.element(this).scope().delete(this)"
     });
     target.append(img);
     }, false);

     $scope.imagearray.push(file);
     console.log($scope.imagearray);
     }
     else {
     console.error("File not Supported")
     }
     }

     //console.log($scope.imagearray);
     }*/

    $scope.ok = function () {
        var formdata = new FormData();
        formdata.entries("name", $scope.apt.name);
        formdata.append("apartment_no", $scope.apt.apartment_no);
        formdata.append("street_name", $scope.apt.street_name);
        formdata.append("city", $scope.apt.city);
        formdata.append("postal_code", $scope.apt.postal_code);
        formdata.append("country", $scope.apt.country);
        formdata.append("rental_type", $scope.apt.rental_type);
        formdata.append("author", $scope.apt.author);
        formdata.append("price", 666.66);
        formdata.append("duration", $scope.apt.duration);
        formdata.append("occupants_no", $scope.apt.occupants_no);
        formdata.append("description", "");
        formdata.append("rank", 7);
        for (let i = 0; i < $scope.imagearray.length; i++) {
            formdata.append('files' + i, $scope.imagearray[i]);
        }


        ApartmentService.updateApartment($scope.apt._id, formdata)
            .then(function (success) {
                $http.post('/user/deleteimage', $scope.image_delete)
                $rootScope.$broadcast('updateApartment');
                $uibModalInstance.close();
            });


    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.delete_modal_image = function (Id, Name) {
        Name = Name.substr(Name.lastIndexOf('/') + 1, Name.length);
        var element = {};
        element.id = Id;
        element.name = Name;
        $("img[id='" + Id + "']").remove();
        $scope.image_delete.push(element);
    }

    $scope.fileSelected = function () {

        var files = $("#modal_imagebox").get(0).files;
        var target = $('#modal_imgReview');
        for (var i = 0; i < files.length; i++) {

            var file = files[i];
            var imageType = /image.*/;
            var reader = new FileReader();
            if (file.type.match(imageType)) {

                $scope.imagearray.push(file);
                reader.readAsDataURL(file);
                reader.addEventListener("load", function (e) {
                    console.log(e);
                    var img = $('<img  />', {
                        src: e.target.result,
                        class: "imageThumb",
                        name: file.name,
                        onClick: "angular.element(this).scope().delete(this)"
                    });
                    target.append(img);
                }, false);

            }
            else {
                console.error("File not Supported")
            }
        }

    }

});


myApp.directive('capitalize', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            var capitalize = function (inputValue) {
                if (inputValue == undefined) inputValue = '';
                var capitalized = inputValue.toUpperCase().replace(/ /g, '');
                if (capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                }
                return capitalized;
            }
            modelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]);  // capitalize initial value
        }
    };
});

myApp.directive('modalDialog', function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function (scope) {
            scope.cancel = function () {
                scope.$dismiss('cancel');
            };
        },
        template: "<div>" +
        "<div class='modal-header'>" +
        "<h3 ng-bind='dialogTitle'></h3>" +
        "<div ng-click='cancel()'>X</div>" +
        "</div>" +
        "<div class='modal-body' ng-transclude></div>" +
        "</div>"
    };
});

/*
 myApp.directive('duration', function () {
 return {
 require: 'ngModel',
 scope: true,
 link: function (scope, element, attrs, modelCtrl) {

 var duration = function (inputValue) {
 var rad =inputValue;
 if (rad == undefined) rad = '';
 scope.$watch('apt.durtype',function(newVal,oldVal){
 if (newVal === oldVal) return;
 var x=newVal;
 if(x!=undefined) rad=rad+" "+ x;
 if (rad !== inputValue) {

 modelCtrl.$setViewValue(rad);
 modelCtrl.$render();
 return rad
 }


 })
 console.log(this.x);


 }

 modelCtrl.$parsers.push(duration);
 duration(scope[attrs.ngModel]);
 }
 };
 });*/


myApp.controller('adminLoginController', ['$scope', 'AdminService', function ($scope, AdminService) {
    $scope.login = function () {

        AdminService.loginAdmin($scope.username, $scope.password);
    }
}]);


myApp.controller('adminRegisterController', ['$scope', 'AdminService', function ($scope, AdminService) {

    $scope.register = function () {

        AdminService
            .registerAdmin($scope.email, $scope.password)


    }


}]);


myApp.controller('adminListController', ['$scope', 'AdminService', 'ApartmentService', '$uibModal', function ($scope, AdminService, ApartmentService, $uibModal) {

    AdminService.getApartments().then(function (data) {
        $scope.apartments = data;
    });


    $scope.editapt = function (id) {

        //Fetch edit Data
        //Change later on to AdminService from here on
        ApartmentService.findById(id)
            .then(function (response) {

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '/partials/templates/modal.html',
                    controller: 'ModalInstanceCtrl',
                    size: 'lg',
                    resolve: {
                        apt: function () {
                            return response
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });

            });


        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };

        //Modal End


    }


    $scope.deleteapt = function (id) {
        swal(
            {
                title: "Are you sure?",
                text: "You will not be able to recover this file!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel plz!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    ApartmentService.deleteApartmentbyId(id)
                        .then(function (response) {
                            swal({title: response.message, type: "success"}, function (isConfirm) {
                                $scope.initialize();
                            });

                        });
                }
                else {
                    swal("Cancelled", "Your File is safe :)", "error");
                }

            });


    }


}]);


