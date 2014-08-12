'use strict';

/**
 * @ngdoc function
 * @name 3DgeoPrintFrontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the 3DgeoPrintFrontendApp
 */
angular.module('3DgeoPrintFrontendApp')
.controller('MainCtrl', 
    ['$http', '$scope', 'config', 'boundaryline',
    function ($http, $scope, config, boundaryline) {
        // Init our LeafletJS Map with Defaults
        angular.extend($scope, {
            defaults: {
                tileLayer: config.leafletTileUri,
                maxZoom: 14
            },
            toronto: {
                lat: 43.7,
                lng: -79.4,
                zoom: 10
            }
        });

        // Set our dataBoundary path points from the getPoints result.
        boundaryline.getPoints().then(function (points) {
            angular.extend($scope, {
                geojson: {
                    data: points,
                    style: {
                        fillColor: 'green',
                        weight: 1,
                        opacity: 1,
                        color: 'red',
                        fillOpacity: 0
                    }
                }
            });
        });

    }]
);
