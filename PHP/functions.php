<?php


function convertCSVToArray($fileName){
  $csv= file_get_contents($fileName);
  $array = array_map("str_getcsv", explode("\n", $csv));
  $returnArray = array();
  // removes header
  array_splice($array, 0, 1);

  foreach($array as $key => $item){
    //checks to make sure the offset is set
    if(isset($item[0])){
      if(InsideOrNot($lat, $lat, $bounds) == 1){
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
  }
  return $returnArray;
}

function convertCSVToJSONAndSend($array){
  $json = json_encode($array);
  print_r($json);
}

function InsideOrNot($lat, $lat, $bounds){
    //If 0 is within |----| (|--0--|)
    if($lat > $bounds['nwlon'] && $lat < $bounds['nelon']){
        //if 0 is within ___
        //                |
        //               ___
        if($lat < $bounds['nwlat'] && $lat > $bounds['swlat']){
            return 1;
        }else{
            return 0;
        }

    }else{
        return 0;
    }
}

?>
