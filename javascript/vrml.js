/**
 * Use to create 3D model files using the VRML 2.0 standard.
 */
var VRML = (function () {
    /**
     * Returns the static portions of the VRML
     * These include structural elements, and
     * VRML metadata.
     */
    function getStaticParts() {
        var str = "#VRML 2.0 utf8\n\
            \n\
            # @author Paul McMonagle <pmcmonagle@tvo.org>\n\
            # Generated using VRML.js\n\
            \n\
            Transform {\n\
                children Shape {\n\
                    geometry IndexedFaceSet {\n\
                        coord Coordinate {\n\
                            point [\n\
                                {%POINTS%}\n\
                            ]\n\
                        }\n\
                        coordIndex [\n\
                            {%COORDS%}\n\
                        ]\n\
                    }\n\
                    appearance Appearance {\n\
                        texture ImageTexture { url \"texture.png\" }\n\
                        material Material { }\n\
                    }\n\
                }\n\
            }\n\
        ";
        
        return str;
    }

    /**
     * Returns a string of comma-seperated vertices
     * for the model as per the VRML standard. The vertices
     * are organized into a top (y = data[y][x]) and
     * bottom (y = 0) layer.
     */
    function getPoints(data, scale) {
        var output = "",
            height = data.length,
            width  = data[0].length,
            dampening = scale || 0,
            ystretch = 1.35,
            x, y;

        // Bottom Points
        for (y=0; y<height; y++) {
            for (x=0; x<width; x++) {
                output += x + " 0 " + (y * ystretch) + ",\n";
            }
        }

        // Top Points
        for (y=0; y<height; y++) {
            for (x=0; x<width; x++) {
                output += x + " " + (data[y][x] * dampening) + " " + (y * ystretch) + ",\n";
            }
        }

        return output;
    }

    /**
     * Returns a string of integers in the form of:
     *  A B C -1 # Facet 1
     *  D E F -1 # Facet 2
     * For all points in data.
     *
     * These integers connect vertices by their array indecies
     * to form facets, as per VRML.
     */
    function getCoords(data) {
        var output = "",
            height = data.length,
            width = data[0].length,
            x, y;
        
        for (y=0; y<height-1; y++) {
            // EAST
            output += y * width + (width-1) + " ";
            output += width * height + (y+1) * width + (width-1) + " ";
            output += (y+1) * width + (width-1) + " -1\n";
            output += y * width + (width-1) + " ";
            output += width * height + y * width + (width-1) + " ";
            output += width * height + (y+1) * width + (width-1) + " -1\n";
            // WEST
            output += y * width + " ";
            output += (y+1) * width + " ";
            output += width * height + (y+1) * width + " -1\n";
            output += y * width + " ";
            output += width * height + (y+1) * width + " ";
            output += width * height + y * width + " -1\n";
            for (x=0; x<width-1; x++) {
                if (y === 0) {
                    // NORTH
                    output += x + " ";
                    output += width * height + x + " ";
                    output += width * height + x + 1 + " -1\n";
                    output += x + " ";
                    output += width * height + x + 1 + " ";
                    output += x + 1 + " -1\n";
                }
                if (y === height-2) {
                    // SOUTH
                    output += x + width * (height-1) + " ";
                    output += width * height + x + 1 + width * (height-1) + " ";
                    output += width * height + x + width * (height-1) + " -1\n";
                    output += x + width * (height-1) + " ";
                    output += x + 1 + width * (height-1) + " ";
                    output += width * height + x + 1 + width * (height-1) + " -1\n";
                }
                // BOTTOM
                output += y * width + x + " ";
                output += x + 1 + " ";
                output += x + 1 + (y+1) * width + " -1\n";
                output += y * width + x + " ";
                output += x + 1 + (y+1) * width + " ";
                output += x + (y+1) * width + " -1\n";
                // TOP
                output += width * height + y * width + x + " ";
                output += width * height + x + (y+1) * width + " ";
                output += width * height + x + 1 + (y+1) * width + " -1\n";
                output += width * height + y * width + x + " ";
                output += width * height + x + 1 + (y+1) * width + " ";
                output += width * height + x + 1 + y * width + " -1\n";
            }
        }

        return output;
    }

    return {
        /**
         * The .wrl file format belongs to the VRML 2.0 standard. It is meant
         * to be UTF8 encoded, and human-readable. This method takes a 2D array
         * of integers and converts them into a topographic model using this
         * standard. The resulting data is returned as a string where it can be
         * written as a .wrl or anything else you'd like to do with it.
         */
        getWrlAsString: function (data, scale) {
            return getStaticParts().replace("{%POINTS%}", getPoints(data, scale)).replace("{%COORDS%}", getCoords(data));
        }
    }
})();
