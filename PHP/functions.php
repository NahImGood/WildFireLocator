<?php

// Converts the CSV into a php array
function convertCSVToArray($fileName){

  $csv = file_get_contents($fileName);
  $array = array_map("str_getcsv", explode("\n", $csv));
  $returnArray = array();
  // removes header
  array_splice($array, 0, 1);

  foreach($array as $key => $item){
    //checks to make sure the offset is set
    if(isset($item[0])){
        $tempArry['latitude'] = $item[0];
        $tempArry['longitude'] = $item[1];
        $tempArry['bright_ti4'] = $item[2];
        $tempArry['scan'] = $item[3];
        $tempArry['track'] = $item[4];
        $tempArry['acq_date'] = $item[5];
        $tempArry['acq_time'] = $item[6];
        $tempArry['satellite'] = $item[7];
        $tempArry['confidence'] = $item[8];
        $tempArry['version'] = $item[9];
        $tempArry['bright_ti5'] = $item[10];
        $tempArry['frp'] = $item[11];
        $tempArry['daynight'] = $item[12];
        array_push($returnArray, $tempArry);
    }
  }
  return $returnArray; // contains nice new data
}

// Encodes the json and sends it out.
function convertCSVToJSONAndSend($array){
  $json = json_encode($array);
  print_r($json);
}

// checks to see if the point is within the bounds of the lat and long
function FindPoint($x1, $y1, $x2, $y2, $x, $y){
    $x =  (float)($x); // CSV data is a string at start
    $y =  (float)($y);
    if ($x > $x1 and $x < $x2){
      // Is inside of Long
        if(abs($y) > abs($y1) and abs($y) < abs($y2)){
          // Disregard negative values
          return true;
        }
    }
    return false;
}

?>
