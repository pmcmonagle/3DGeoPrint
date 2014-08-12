<?php

/**
 * This file is expected to:
 *  1. Take a lat, lng, width and height
 *  2. Select an appropriate data file from registry.json
 *  3. Get the relative x,y position of the top-left corner
 *     within that file.
 *  4. Determine if the width and height extend into adjacent
 *     data files.
 *  5. Determine the resolution factor based on the total
 *     covered area.
 *  6. Determine the appropriate elevation scaling based on
 *     the covered area / resolution.
 *  7. Read the appropriate data files into a 2D Array.
 *  8. Print the result as JSON.
 */

require_once("ElevationMap.php");

$map = new ElevationMap($request);
echo($map->getElevationsAsJSON());
