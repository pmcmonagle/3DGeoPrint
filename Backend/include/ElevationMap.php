<?php

/**
 * @Class ElevationMap
 */
class ElevationMap {

    const REGISTRY = "database/registry.json";

    private $request;
    private $x;
    private $y;
    private $lat;
    private $lon;
    private $width;
    private $height;
    private $resolution;
    private $scale;
    private $dataFiles = array();
    
    /**
     * @constructor
     */
    function __construct($request) {
        $this->request = $request;
        $this->parseRequest();
        $this->determineDataFiles();
        $this->determineResolutionAndScale();
    }

    /**
     * Parse the lat, lon, width and height out of
     * the request. 404 if they're missing or not
     * numeric.
     */
    private function parseRequest() {
        $reqVars = explode("/", $this->request);
        if (
            count($reqVars) < 4 ||
            !is_numeric($reqVars[0]) ||
            !is_numeric($reqVars[1]) ||
            !is_numeric($reqVars[2]) ||
            !is_numeric($reqVars[3])
        ) {
            include("404.php");
        }

        $this->lat    = $reqVars[0];
        $this->lon    = $reqVars[1];
        $this->width  = $reqVars[2];
        $this->height = $reqVars[3];
    }

    /**
     * Get the appropriate dataFiles out of the
     * Registry.
     */
    private function determineDataFiles() {
        $registry = json_decode(file_get_contents(self::REGISTRY));

        for ($y=0; $y<count($registry->data); $y++) {
            for ($x=0; $x<count($registry->data[0]); $x++) {
                if (
                    $registry->data[$y][$x] !== null &&
                    $this->lat <= -$y + $registry->top &&
                    $this->lat >  -$y + $registry->top - 1 &&
                    $this->lon >=  $x + $registry->left &&
                    $this->lon <   $x + $registry->left + 1
                ) {
                    $this->dataFiles[0] = $registry->data[$y][$x];

                    $this->x =  ($this->lon - ($registry->left + $x)) * 1201;
                    $this->y = -($this->lat - ($registry->top  - $y)) * 1201;

                    // This currently handled by dbdriver.py, but let's include it anyway
                    if (isset($registry->data[$y][$x+1]))   { $this->dataFiles[1] = $registry->data[$y][$x+1]; }
                    if (isset($registry->data[$y+1][$x]))   { $this->dataFiles[2] = $registry->data[$y+1][$x]; }
                    if (isset($registry->data[$y+1][$x+1])) { $this->dataFiles[3] = $registry->data[$y+1][$x+1]; }
                    
                    return;
                }
            }
        }

        // If the request was valid, we would have returned already.
        // Send 404.
        include("404.php");
    }

    /**
     * Determine the resolution. The value should be a positive integer
     * and is treated as value / resolution (ie. 2 is half the resolution of 1)
     */
    private function determineResolutionAndScale() {
        $this->resolution = (($this->width - $this->width % 200) / 200) + 1;
        $this->scale = 0.08 - (0.00005 * $this->width / $this->resolution) - (0.00005 * $this->width);
    }

    /**
     * Return a JSON String of elevations.
     */
    public function getElevationsAsJSON() {
        $command = "/usr/local/bin/python database/dbdriver.py "
            . $this->dataFiles[0].".data" ." "
            . $this->x ." "
            . $this->y ." "
            . $this->width  ." "
            . $this->height ." "
            . $this->resolution ." "
            . $this->scale ." "
            . "no" ." "
            . "2>&1"; //debug

        return(exec($command, $output_array));
    }
}
