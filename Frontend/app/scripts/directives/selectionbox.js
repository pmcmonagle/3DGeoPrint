'use strict';

/**
 * @ngdoc directive
 * @name 3DgeoPrintFrontendApp.directive:selectionbox
 * @description
 * # selectionbox
 */
angular.module('leaflet-directive')
.directive('selectionbox', function ($log, $rootScope, $q, leafletData, leafletHelpers, leafletMapDefaults, leafletMarkersHelpers, leafletEvents) {
    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: ['leaflet', '?layers'],

        link: function postLink(scope, element, attrs, controller) {
            var mapController = controller[0];


        }
    };
});
