<?php

/**
 * Accept POST coordinates from AJAX.
 * Forward these to Python so that we can retreive
 * a JSON response.
 */

if (
    !isset($_GET['mapId']) ||
    !isset($_GET['diffX']) ||
    !isset($_GET['diffY']) ||
    !isset($_GET['width']) ||
    !isset($_GET['height']) ||
    !isset($_GET['resolution'])
) {
    echo(json_encode(array(
        "success" => 0,
        "error" => "Missing Parameters"
    )));
    exit;
}

$exec_string = "/usr/bin/python ../python/dbdriver.py " 
    . escapeshellarg($_GET['mapId'].".data") ." "
    . escapeshellarg($_GET['diffX'])  ." "
    . escapeshellarg($_GET['diffY'])  ." "
    . escapeshellarg($_GET['width'])  ." "
    . escapeshellarg($_GET['height']) ." "
    . escapeshellarg($_GET['resolution']) ." no"//;
    . " 2>&1"; //debug
$output = exec($exec_string, $output_arr);

echo(json_encode(array(
    "success" => 1,
    "data" => json_decode($output)
)));
exit;

?>
