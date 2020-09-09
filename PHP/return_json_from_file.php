<?php
ob_start('ob_gzhandler');

require 'functions.php';
$fileName = $_GET['fileName'];
// $fileName = "J1_VIIRS_C2_USA_contiguous_and_Hawaii_VJ114IMGTDL_NRT_2020241";
$fireDataArray = convertCSVToArray("../firedata/FIRMS/noaa-20-viirs-c2/USA_contiguous_and_Hawaii/".$fileName.".txt");
// $jsonData = convertCSVToJSON($fireDataArray);
convertCSVToJSONAndSend($fireDataArray);

?>
