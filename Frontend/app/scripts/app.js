'use strict';

/**
 * @ngdoc overview
 * @name 3DgeoPrintFrontendApp
 * @description
 * # 3DgeoPrintFrontendApp
 *
 * Main module of the application.
 */
angular.module('3DgeoPrintFrontendApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'leaflet-directive'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    })
    .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
})
.constant('config', {
    apiUriBase:            'http://alpha.tvo.org/prototypes/3DGeoPrint-Backend/',
    apiRegistryResource:   'registry/',
    apiElevationsResource: 'elevations/{lat}/{lon}/{width}/{height}',
    leafletTileUri:        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
});
