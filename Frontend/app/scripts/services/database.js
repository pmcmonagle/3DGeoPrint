'use strict';

/**
 * @ngdoc service
 * @name 3DgeoPrintFrontendApp.database
 * @description
 * # database
 * Factory in the 3DgeoPrintFrontendApp.
 */
angular.module('3DgeoPrintFrontendApp')
.factory('database',
    ['$http', 'config',
    function ($http, config) {
        var registryUri   = config.apiUriBase + config.apiRegistryResource,
            elevationsUri = config.apiUriBase + config.apiElevationsResource;

        return {
            getRegistry: function () {
                return $http.get(registryUri).then(function (result) {
                    return result.data;
                });
            },
            getElevations: function (lat, lon, width, height) {
                var processedUri = elevationsUri
                    .replace('{lat}', lat)
                    .replace('{lon}', lon)
                    .replace('{width}', width)
                    .replace('{height}', height);

                return $http.get(processedUri).then(function (result) {
                    return result.data;
                });
            }
        };
    }]
);
