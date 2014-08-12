/**
 * WriteFacets
 * Methods for writing North, South, East, West and Top, Bottom Facets
 * Facets are written to a ThreeJS Geometry Object.
 */

WriteFacets = (function () {
    // Private
    var data,
        mid,
        dampening;
    
    /**
     * @constructor
     */
    function WriteFacets(arr,scale) {
        this.result = new THREE.Geometry();
        dampening = scale;
        data = arr;
        mid  = arr.length / 2;
    }

    /* All facets are written by pushing three vertices
     * to the geometry, followed by pushing a facet that
     * points to the vertices by their index.
     * The difference between top, bottom, east, west, etc.
     * is the order in which the vertices are defined. Using
     * the right-hand rule, the order of vertices determines
     * their normal.
     */
    
    /**
     * The top facet is defined as:
     *  x,   y,   data[y][x]
     *  x+1, y,   data[y][x+1]
     *  x+1, y+1, data[y+1][x+1]
     * ---------------------------
     *  x+1, y+1, data[y+1][x+1]
     *  x,   y+1, data[y+1][x]
     *  x,   y,   data[y][x]
     */
    WriteFacets.prototype.top = function (x, y) {
        var lowerbound = 4,
            upperbound = 20,
            elevation  = Math.min(data[y][x] / 300, 1);

        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid,   data[y][x]*dampening));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid,   data[y][x+1]*dampening));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid+1, data[y+1][x+1]*dampening));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));

        this.result.faces[this.result.faces.length - 1].color.setRGB(
            1 * Math.pow(elevation, 2) + 0 * elevation + 0, // R - Quadratic - y = ax^2 + bx + c
            1 * elevation + 0,                              // G - Linear    - y = mx + b
            0.5 * Math.cos(6 * elevation) + 0.5             // B - Cosine    - y = f * cos(p * x) + o
        );
        
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid+1, data[y+1][x+1]*dampening));
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid+1, data[y+1][x]*dampening));
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid,   data[y][x]*dampening));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));

        this.result.faces[this.result.faces.length - 1].color.setRGB(
            1 * Math.pow(elevation, 2) + 0 * elevation + 0, // R - Quadratic - y = ax^2 + bx + c
            1 * elevation + 0,                              // G - Linear    - y = mx + b
            0.5 * Math.cos(6 * elevation) + 0.5             // B - Cosine    - y = f * cos(p * x) + o
        );
    }
    
    /*
     * The bottom facet is defined as:
     *  x,   y,   0 
     *  x+1, y+1, 0
     *  x+1, y,   0
     * ---------------------------
     *  x,   y,   0
     *  x,   y+1, 0
     *  x+1, y+1, 0
     */
    WriteFacets.prototype.bottom = function (x, y) {
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid,   0));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid+1, 0));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid,   0));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
        
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid,   0));
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid+1, 0));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid+1, 0));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
    }
     
    /*
     * The north facet is defined as:
     *  x,   y, 0 
     *  x+1, y, 1
     *  x,   y, 1
     * ---------------------------
     *  x,   y, 0
     *  x+1, y, 0
     *  X+1, y, 1
     */
    WriteFacets.prototype.north = function (x, y) {
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid, 0));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid, 1));
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid, 1));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
        
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid, 0));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid, 0));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid, 1));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
    }
     
    /*
     * The south facet is defined as:
     *  x,   y, 0 
     *  x,   y, 1
     *  x+1, y, 1
     * ---------------------------
     *  x,   y, 0
     *  X+1, y, 1
     *  x+1, y, 0
     */
    WriteFacets.prototype.south= function (x, y) {
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid, 0));
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid, 1));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid, 1));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
        
        this.result.vertices.push(new THREE.Vector3(x-mid,   y-mid, 0));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid, 1));
        this.result.vertices.push(new THREE.Vector3(x-mid+1, y-mid, 0));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
    }
     
    /*
     * The east facet is defined as:
     *  x, y,   0 
     *  x, y,   1
     *  x, y+1, 1
     * ---------------------------
     *  x, y,   0
     *  X, y+1, 1
     *  x, y+1, 0
     */
    WriteFacets.prototype.east = function (x, y) {
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid,   0));
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid,   1));
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid+1, 1));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
        
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid,   0));
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid+1, 1));
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid+1, 0));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
    }
     
    /*
     * The west facet is defined as:
     *  x, y,   0 
     *  x, y+1, 1
     *  x, y,   1
     * ---------------------------
     *  x, y,   0
     *  x, y+1, 0
     *  X, y+1, 1
     */
    WriteFacets.prototype.west = function (x, y) {
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid,   0));
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid+1, 1));
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid,   1));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
        
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid,   0));
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid+1, 0));
        this.result.vertices.push(new THREE.Vector3(x-mid, y-mid+1, 1));

        this.result.faces.push(new THREE.Face3(
            this.result.vertices.length-3,
            this.result.vertices.length-2,
            this.result.vertices.length-1
        ));
    }

    /**
     * Mostly stolen from StackOverflow - hope it works.
     */
    WriteFacets.prototype.generateUVs = function () {
        this.result.computeBoundingBox();
        var i, v1, v2, v3,
            max = this.result.boundingBox.max,
            min = this.result.boundingBox.min,
            offset = new THREE.Vector2(0 - min.x, 0 - min.y),
            range  = new THREE.Vector2(max.x - min.x, max.y - min.y);

        this.result.faceVertexUvs[0] = [];
        var faces = this.result.faces;

        for (i=0; i<this.result.faces.length; i++) {
            v1 = this.result.vertices[faces[i].a];
            v2 = this.result.vertices[faces[i].b];
            v3 = this.result.vertices[faces[i].c];

            this.result.faceVertexUvs[0].push([
                new THREE.Vector2( (v1.x + offset.x)/range.x, (v1.y + offset.y)/range.y ),
                new THREE.Vector2( (v2.x + offset.x)/range.x, (v2.y + offset.y)/range.y ),
                new THREE.Vector2( (v3.x + offset.x)/range.x, (v3.y + offset.y)/range.y )
            ]);
        }

        this.result.uvsNeedUpdate = true;
    }
   
    return WriteFacets;
})();
