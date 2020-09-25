<?php

/**
 * Accept POST coordinates from AJAX.
 * Forward these to Python so that we can retreive
 * a JSON response.
 */

function pad_array($data) {
    foreach ($data as &$row) {
        array_push($row, 1);
        array_unshift($row, 1);
        $row = array_reverse($row);
    }

    array_push($data, array_fill(0, count($data[0]), 1));
    array_unshift($data, array_fill(0, count($data[0]), 1));

    return $data;
}


function writeEast($x, $y) {
    $scaleY = 1.35;
    $a = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x,$y*$scaleY,1, $x,$y*$scaleY+$scaleY,1);
    $a .= pack('s', 0);
    $b = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x,$y*$scaleY+$scaleY,1, $x,$y*$scaleY+$scaleY,0);
    $b .= pack('s', 0);
    return $a.$b;
}
function writeWest($x, $y) {
    $scaleY = 1.35;
    $a = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x,$y*$scaleY+$scaleY,1, $x,$y*$scaleY,1);
    $a .= pack('s', 0);
    $b = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x,$y*$scaleY+$scaleY,0, $x,$y*$scaleY+$scaleY,1);
    $b .= pack('s', 0);
    return $a.$b;
}
function writeNorth($x, $y) {
    $scaleY = 1.35;
    $a = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x+1,$y*$scaleY,1, $x,$y*$scaleY,1);
    $a .= pack('s', 0);
    $b = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x+1,$y*$scaleY,0, $x+1,$y*$scaleY,1);
    $b .= pack('s', 0);
    return $a.$b;
}
function writeSouth($x, $y) {
    $scaleY = 1.35;
    $a = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x,$y*$scaleY,1, $x+1,$y*$scaleY,1);
    $a .= pack('s', 0);
    $b = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x+1,$y*$scaleY,1, $x+1,$y*$scaleY,0);
    $b .= pack('s', 0);
    return $a.$b;
}
function writeBottom($x, $y) {
    $scaleY = 1.35;
    $a = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x+1,$y*$scaleY+$scaleY,0, $x+1,$y*$scaleY,0);
    $a .= pack('s', 0);
    $b = pack('f*', 0,-1,0, $x,$y*$scaleY,0, $x,$y*$scaleY+$scaleY,0, $x+1,$y*$scaleY+$scaleY,0);
    $b .= pack('s', 0);
    return $a.$b;
}
function writeTop($x, $y, $data, $dampening) {
    $scaleY = 1.35;
    $a = pack('f*', 0,-1,0, $x,$y*$scaleY,$data[$y][$x]*$dampening, $x+1,$y*$scaleY,$data[$y][$x+1]*$dampening, $x+1,$y*$scaleY+$scaleY,$data[$y+1][$x+1]*$dampening);
    $a .= pack('s', 0);
    $b = pack('f*', 0,-1,0, $x+1,$y*$scaleY+$scaleY,$data[$y+1][$x+1]*$dampening, $x,$y*$scaleY+$scaleY,$data[$y+1][$x]*$dampening, $x,$y*$scaleY,$data[$y][$x]*$dampening);
    $b .= pack('s', 0);
    return $a.$b;
}

if (
    !isset($_GET['mapId']) ||
    !isset($_GET['x']) ||
    !isset($_GET['y']) ||
    !isset($_GET['w']) ||
    !isset($_GET['h']) ||
    !isset($_GET['r']) ||
    !isset($_GET['s'])
) {
    echo(json_encode(array(
        "success" => 0,
        "error" => "Missing Parameters"
    )));
    exit;
}

$exec_string = "/usr/bin/python ../python/dbdriver.py " 
    . escapeshellarg($_GET['mapId'].".data") ." "
    . escapeshellarg($_GET['x'])  ." "
    . escapeshellarg($_GET['y'])  ." "
    . escapeshellarg($_GET['w'])  ." "
    . escapeshellarg($_GET['h'])  ." "
    . escapeshellarg($_GET['r'])  ." yes"//;
    . " 2>&1"; //debug
$json = exec($exec_string, $output_arr);
$data = json_decode($json);
$data = pad_array($data);

$width = count($data[0]) -1;
$height = count($data) -1;

$binarydata = pack("A80", "Ontario Topographic Model");
$binarydata .= pack("i", ($width * $height * 4) + ($width * 4) + ($height * 4));

foreach ($data as $y => $row) {
    if ($y == count($data)-1) continue;
    $binarydata .= writeEast(0, $y);
    $binarydata .= writeWest($width, $y);
    foreach($row as $x => $value) {
        if ($x == count($row)-1) continue;
        if ($y == 0)         $binarydata .= writeNorth($x, $y);
        if ($y == $height-1) $binarydata .= writeSouth($x, $y+1);
        $binarydata .= writeBottom($x, $y);
        $binarydata .= writeTop($x, $y, $data, $_GET['s']);
    }
}

// Set headers before echoing
header("Content-Type: application/force-download");
header("Content-Type: application/octet-stream");
header("Content-Type: application/download");
header("Content-Disposition: attachment; filename=\"ontariotopography.stl\"");
header("Content-Description: File Transfer");
header("Content-Transfer-Encoding: binary");
header("Content-Length: " . strlen($binarydata));

echo($binarydata);
exit;
?>
