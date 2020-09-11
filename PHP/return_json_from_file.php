<?php
ob_start('ob_gzhandler');

require 'functions.php';
 $fileName = $_GET['fileName'];


// $bounds = array();
// $bounds['swlat'] = $_GET['swlat'];
// $bounds['nelon'] = $_GET['nelon'];
// $bounds['nwlat'] = $_GET['nwlat'];
// $bounds['nwlon'] = $_GET['nwlon'];
// Testing
//$fileName = "../firedata/data2.txt";
// $bounds['swlat'] = "34.396513573234884";
// $bounds['nwlat'] =  "39.08831550034304";
// $bounds['nelon'] = "-108.87102500000002";
// $bounds['nwlon'] = "-129.964775";
$file =  "../firedata/FIRMS/noaa-20-viirs-c2/USA_contiguous_and_Hawaii/".$fileName.".txt";
$fireDataArray = convertCSVToArray($file);
convertCSVToJSONAndSend($fireDataArray);

?>
