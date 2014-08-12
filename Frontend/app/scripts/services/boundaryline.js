'use strict';

/**
 * @ngdoc service
 * @name 3DgeoPrintFrontendApp.boundaryline
 * @description
 * # boundaryline
 * Factory in the 3DgeoPrintFrontendApp.
 */
angular.module('3DgeoPrintFrontendApp')
.factory('boundaryline',
    ['database',
    function (database) {
        /**
         * This is set once by createBoundary, and returned
         * by the public getPoints method.
         */
        var boundary;

        /**
         * @private
         * Pull the left-most and right-most point
         * from each row in the dataset, and return
         * as an Array.
         */
        function getPerimeterPoints(dataset) {
            var perimeterPoints = [],
                y, x;

            for (y=0; y<dataset.data.length; y++) {
                // Loop forward to grab our left-most points
                // from each row.
                for (x=0; x<dataset.data[y].length; x++) {
                    if (dataset.data[y][x] !== null) {
                        perimeterPoints.push([]);
                        perimeterPoints[perimeterPoints.length - 1][0] = [-y + dataset.top, x + dataset.left];
                        break;
                    }
                }

                // Loop backward to grab our right-most points
                // from each row.
                for (x=dataset.data[y].length - 1; x>=0; x--) {
                    if (dataset.data[y][x] !== null) {
                        perimeterPoints[perimeterPoints.length - 1][1] = [-y + dataset.top, x + dataset.left];
                        break;
                    }
                }
            }

            return perimeterPoints;
        }

        /**
         * @private
         * Set the boundary using an array of perimeter points.
         */
        function createBoundary(points) {
            var newBoundary = {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[]]
                    }
                }, i;

            // Traverse down the perimeter to create the east lines
            for (i=0; i<points.length; i++) {
                newBoundary.geometry.coordinates[0].push([points[i][1][1] + 1, points[i][1][0]]);
                newBoundary.geometry.coordinates[0].push([points[i][1][1] + 1, points[i][1][0] - 1]);
            }

            // Traverse back up the perimeter to create the west lines
            for (i=points.length - 1; i>=0; i--) {
                newBoundary.geometry.coordinates[0].push([points[i][0][1], points[i][0][0] - 1]);
                newBoundary.geometry.coordinates[0].push([points[i][0][1], points[i][0][0]]);
            }

            boundary = newBoundary;
            return newBoundary;
        }

        return {
            /**
             * Automatically grabs the data set from the registry, and
             * returns a set of points used to create a line around the
             * boundary area.
             */
            getPoints: function () {
                return database.getRegistry().then(function (result) {
                    return boundary ? boundary : createBoundary( getPerimeterPoints(result) );
                });
            }
        };
    }]
);
