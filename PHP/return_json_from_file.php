<?php
ob_start('ob_gzhandler');

require 'functions.php';
 $fileName = $_GET['fileName'];
//$fileName = "../firedata/data2.txt";

// $bounds = array();
// $bounds['nelat'] = $_GET['nelat'];
// $bounds['swlon'] = $_GET['swlon'];
// $bounds['selat'] = $_GET['selat'];
// $bounds['selon'] = $_GET['selon'];
// // // used in scripts
// $bounds['swlat'] = $_GET['swlat'];
// $bounds['nelon'] = $_GET['nelon'];
// $bounds['nwlat'] = $_GET['nwlat'];
// $bounds['nwlon'] = $_GET['nwlon'];

// $bounds['swlat'] = "34.396513573234884";
// $bounds['nwlat'] =  "39.08831550034304";
//
// $bounds['nelon'] = "-108.87102500000002";
// $bounds['nwlon'] = "-129.964775";
$file =  "../firedata/FIRMS/noaa-20-viirs-c2/USA_contiguous_and_Hawaii/".$fileName.".txt";
// $fileName = "J1_VIIRS_C2_USA_contiguous_and_Hawaii_VJ114IMGTDL_NRT_2020241";
$fireDataArray = convertCSVToArray($file);
// $jsonData = convertCSVToJSON($fireDataArray);
convertCSVToJSONAndSend($fireDataArray);

?>
