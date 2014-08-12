<?php
/**
 * This is the request handler for a mini RESTful API Service
 * The servers exposes two methods:
 *  GET /registry
 *  GET /elevations/{lat}/{lon}/{width}/{height}
 */

// Set a loose cross-origin header. There shouldn't be any security concerns here:
// the server is stateless and read-only.
header("access-control-allow-origin: *");

if (
    !isset($_GET['resource_type']) ||
    ($_GET['resource_type'] === "elevations" && !isset($_GET['request']))
) {
    include("include/404.php");
}

$resource_type  = $_GET['resource_type'];       // eg. "elevations"
$request        = $_GET['request'];             // Anything after the resource type
$method         = $_SERVER['REQUEST_METHOD'];   // eg. GET, POST

// Switch on the resource_type and execute the
// appropriate response handler.
switch ($resource_type) {
    case "registry":
        include("include/registry.php");
        break;
    case "elevations":
        include("include/elevations.php");
        break;
    default:
        include("include/404.php");
        break;
}
