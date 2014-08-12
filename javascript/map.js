/**
 * Use the Leaflet API to draw a lovely interactive map to
 * the page!
 */

var LeafletMap = function (dataCoords) {
    /* Alternate TileServers */
    //tileserver = "http://{s}.tile.cloudmade.com/a9258a1021274000a93e5281de3a27a1/26250/256/{z}/{x}/{y}.png"; // Roads + Place Names, No Terrain
    //tileserver = "http://a{s}.acetate.geoiq.com/tiles/terrain/{z}/{x}/{y}.png"; // Terrian + Roads, no Place Names;
    //tileserver = "http://1.aerial.maps.api.here.com/maptile/2.1/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8?app_id=mcbVNhqphjkusJUmBmMe&app_code=CZ4H_3R97sqbYArm-5zLGg"; // All features, but weak topography.
    
    var LeafletMap = {
        map: L.map("map").setView([43.7, -79.4], 10)
    };

    var map = LeafletMap.map,
        tileserver = "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        update = true,
        mouseLng, mouseLat,
        tileLayer = L.tileLayer(tileserver, {
            attribution: "Map Data &copy; OpenStreetMap contributors, CC-BY-SA, Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
            maxZoom: 14
        }),
        polygon = L.polygon([
            [44.0, -80.0],
            [43.8, -80.0],
            [43.8, -79.8],
            [44.0, -79.8],
        ], {color: "green"}),
        handle = L.polygon([
            [43.82, -79.82],
            [43.8,  -79.82],
            [43.8,  -79.8],
            [43.82, -79.8],
        ], {color: "blue"});
    
    makeBoundary(dataCoords);

    polygon.height = 208;
    polygon.addTo(map);
    handle.addTo(map);
    tileLayer.addTo(map);
    LeafletMap.tileLayer = tileLayer;

    /*
     * Polygon/Handle Mouse Events
     */
    map.on("mousemove", function (e) {
        if (update) update(e.latlng);
    });
    polygon.on("mousedown", function (e) {
        mouseLng = e.latlng.lng - polygon._latlngs[0].lng;
        mouseLat = e.latlng.lat - polygon._latlngs[0].lat;
        update = drag;
    });
    handle.on("mousedown", function (e) {
        mouseLng = e.latlng.lng - handle._latlngs[0].lng;
        mouseLat = e.latlng.lat - handle._latlngs[0].lat;
        update = resize;
    });
    window.onmouseup = function () {
        var datafile = selectCoords(polygon._latlngs),
            e;
       
        if (datafile === false) {
            console.warn("Selection Warning: Selected Area is Out of Bounds");
            // TODO: return the selection area to its last valid point
            return;
        }

        e = {
            latLng: { lat: polygon._latlngs[0].lat, lng: polygon._latlngs[0].lng },
            mapId:  datafile.file,
            diffX:  (polygon._latlngs[0].lng - (dataCoords.left + datafile.lng)) * 1201,
            diffY: -(polygon._latlngs[0].lat - (dataCoords.top  - datafile.lat)) * 1201,
            width:  (polygon._latlngs[2].lng - polygon._latlngs[0].lng) * 1201,
            height:-(polygon._latlngs[2].lat - polygon._latlngs[0].lat) * 1201,
        };

        e.resolution = ((e.width - e.width % 200) / 200) + 1;
        e.scale = 0.08 - (0.00005 * e.width / e.resolution) - (0.00005 * e.width); 

        if (update && e.diffX >= 0 && e.diffY >= 0 && datafile) drop(e);
        update = null;
    }

    /**
     * Create a boundary based on the top-left coord.
     */
    function makeBoundary(dataObj) {
        var totalRows = [],
            boundary = [],
            perimeter,
            y, x;

        for (y=0; y<dataObj.data.length; y++) {
            // Add our left-most point to the row.
            for (x=0; x<dataObj.data[y].length; x++) {
                if (dataObj.data[y][x] !== null) {
                    totalRows.push([]);
                    totalRows[totalRows.length - 1][0] = [-y + dataObj.top, x + dataObj.left];
                    break;
                }
            }
            // Add the right-most point
            for (x=dataObj.data[y].length - 1; x>=0; x--) {
                if (dataObj.data[y][x] !== null) {
                    totalRows[totalRows.length - 1][1] = [-y + dataObj.top, x + dataObj.left];
                    break;
                }
            }
        }

        // Traverse down the array
        for (i=0; i<totalRows.length; i++) {
            boundary.push([ totalRows[i][1][0], totalRows[i][1][1] + 1]);
            boundary.push([ totalRows[i][1][0] - 1, totalRows[i][1][1] + 1 ]);
        }

        // Traverse back up the array
        for (i=totalRows.length - 1; i>=0; i--) {
            boundary.push([ totalRows[i][0][0] - 1, totalRows[i][0][1] ]);
            boundary.push(totalRows[i][0]);
        }

        perimeter = L.polygon(boundary, {
            color: "red",
            fillOpacity: 0
        });
        perimeter.addTo(map);
    }

    /**
     * @private
     * Move the handle and redraw.
     * Resizethe polygon and redraw.
     */
    function resize(e) {
        var origLng = handle._latlngs[0].lng,
            origLat = handle._latlngs[0].lat,
            movementLng = origLng - (e.lng - mouseLng),
            movementLat = origLat - (e.lat - mouseLat),
            maxWidth = 0.9,
            i;

        // Return if the size is too small
        if (handle._latlngs[0].lng - movementLng < polygon._latlngs[0].lng || handle._latlngs[0].lat + movementLng > polygon._latlngs[0].lat) {
            return;
        }
        // Also return if the size is too great
        if (handle._latlngs[0].lng - movementLng > polygon._latlngs[0].lng + maxWidth || handle._latlngs[0].lat + movementLng > polygon._latlngs[0].lat + maxWidth) {
            return;
        }

        for (i in handle._latlngs) {
            if (true) {
                handle._latlngs[i].lng = handle._latlngs[i].lng - movementLng;
                handle._latlngs[i].lat = handle._latlngs[i].lat + movementLng;
            } else {
                handle._latlngs[i].lng = handle._latlngs[i].lng + movementLat;
                handle._latlngs[i].lat = handle._latlngs[i].lat - movementLat;
            }
        }

        handle.redraw();

        polygon._latlngs[1].lat = handle._latlngs[1].lat;
        polygon._latlngs[2].lat = handle._latlngs[2].lat;
        polygon._latlngs[2].lng = handle._latlngs[2].lng;
        polygon._latlngs[3].lng = handle._latlngs[3].lng;

        // Save our height for use by preview texturing
        polygon.height = LeafletMap.map.latLngToLayerPoint(polygon._latlngs[1]).y - LeafletMap.map.latLngToLayerPoint(polygon._latlngs[0]).y;

        polygon.redraw();
    }
    
    /**
     * @private
     * Move the polygon and redraw.
     * Move the handle and redraw.
     */
    function drag(e) {
        var origLng = polygon._latlngs[0].lng,
            origLat = polygon._latlngs[0].lat,
            diffLng,
            diffLat,
            i;

        for (i in polygon._latlngs) {
            diffLng = polygon._latlngs[i].lng - origLng;
            diffLat = polygon._latlngs[i].lat - origLat; 

            polygon._latlngs[i].lng = e.lng + diffLng - mouseLng;
            polygon._latlngs[i].lat = e.lat + diffLat - mouseLat;
        }

        // Save our height for use by preview texturing
        polygon.height = LeafletMap.map.latLngToLayerPoint(polygon._latlngs[1]).y - LeafletMap.map.latLngToLayerPoint(polygon._latlngs[0]).y;

        polygon.redraw();

        for (i in handle._latlngs) {
            diffLng = handle._latlngs[i].lng - origLng;
            diffLat = handle._latlngs[i].lat - origLat; 

            handle._latlngs[i].lng = e.lng + diffLng - mouseLng;
            handle._latlngs[i].lat = e.lat + diffLat - mouseLat;
        }

        handle.redraw();
    }

    /**
     * @private
     * Forward Polygon coordinates to MapPreview.loadNewMap(arr)
     * when the Polygon is dropped.
     */
    function drop(data) {
        if (!jQuery) return;

        jQuery.getJSON("php/preview.php", data).done(function (json) {
            MapPreview.loadNewMap(json.data, data.scale, data.latLng, polygon.height);
            MapPreview.createDownloadLink(data.mapId, data.diffX, data.diffY, data.width, data.height, data.scale);
            MapPreview.createWrlLink(json.data, data.scale);
        }).fail(function (xhr, textstatus, error) {
            console.error(textstatus + ": " + error);
        });
    }

    /**
     * @private
     * Determine the correct data file based on the coords.
     * @param  {Array}   An array of point objects, each with a lat and a lng.
     * @return {String}  Returns the datafile that the coords fall into.
     * @return {Array}   Return an array of strings if the area falls across multiple data files.
     * @return {Bool}    Returns FALSE if no datafile contains the given coords. 
     */
    function selectCoords(points) {
        var lat, 
            lng;

        if (points.length !== 4) return false;

        for (lat=0; lat<dataCoords.data.length; lat++) {
            for (lng=0; lng<dataCoords.data[0].length; lng++) {
                if (
                    dataCoords.data[lat][lng] !== null &&
                    points[0].lat <= -lat + dataCoords.top &&
                    points[0].lat >  -lat + dataCoords.top - 1 &&
                    points[0].lng >=  lng + dataCoords.left &&
                    points[0].lng <   lng + dataCoords.left + 1
                ) {
                    return {
                        "file": dataCoords.data[lat][lng],
                        "lat":  lat,
                        "lng":  lng
                    }
                }
            }
        }

        return false;
    }

    return LeafletMap;
};
