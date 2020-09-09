<?php
ob_start('ob_gzhandler');

require 'functions.php';
$fileName = $_GET['fileName'];
// $fileName = "../firedata/data2.txt";

$bounds = array();
$bounds['nelat'] = $_GET['nelat'];
$bounds['swlon'] = $_GET['swlon'];
$bounds['selat'] = $_GET['selat'];
$bounds['selon'] = $_GET['selon'];
// // used in scripts
$bounds['swlat'] = $_GET['swlat'];
$bounds['nelon'] = $_GET['nelon'];
$bounds['nwlat'] = $_GET['nwlat'];
$bounds['nwlon'] = $_GET['nwlon'];

// $bounds['swlat'] = 0;
// $bounds['nwlat'] =  1000;
//
// $bounds['nelon'] = 0;
// $bounds['nwlon'] = 1000;
// "../firedata/FIRMS/noaa-20-viirs-c2/USA_contiguous_and_Hawaii/".$fileName.".txt";
// $fileName = "J1_VIIRS_C2_USA_contiguous_and_Hawaii_VJ114IMGTDL_NRT_2020241";
$fireDataArray = convertCSVToArray("../firedata/FIRMS/noaa-20-viirs-c2/USA_contiguous_and_Hawaii/".$fileName.".txt", $bounds);
// $jsonData = convertCSVToJSON($fireDataArray);
convertCSVToJSONAndSend($fireDataArray);

?>
