// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">
var map, pointarray, heatmap;
var gradient, gradientStep = -1;
var currentLat;
var currentLng;
var currentZoom = 7;
var serverData = new Array(6);
var allowedTimed = new Array(6);
var rawServerData = new Array(6);
var intialLoad;

function initMap(){
  intialLoad = true;
  getServerData(0);
}

function loadMapData(numberOfDaysBack){
  stopLoading("dateLoader");
  intialLoad = false;
  var mapOptions = {
      zoom: currentZoom,
      center: new google.maps.LatLng(37.774546, -122.433523),
      mapTypeId: google.maps.MapTypeId.SATELLITE,
  };

  map = new google.maps.Map(document.getElementById('fireMap'), mapOptions);

  if(serverData[numberOfDaysBack]){
      var pointArray = new google.maps.MVCArray(serverData[numberOfDaysBack]);
  } else {
    alert("Missing Data");
  }

  currentZoom = map.getZoom();
  heatmap = new google.maps.visualization.HeatmapLayer({
      data: pointArray,
      maxIntensity: 200,
      opacity: .7,
      radius: getNewRadius(currentZoom)
  });
  heatmap.setMap(map);
  // will change the gradiant to a negative
  // setGradient();
  // will add event listenter for once the tiles load
  // then will run function at end of call
  // google.maps.event.addListenerOnce(map, 'tilesloaded', modulateGradient);
   google.maps.event.addListener(map, 'zoom_changed', function () {
       currentZoom = map.getZoom();
       heatmap.setOptions({
         opacity: .7,
         radius: getNewRadius(currentZoom)
       });
   });

   google.maps.event.addListener(map, 'maptypeid_changed', function () {
     heatmap.setMap(null);
     currentZoom = map.getZoom();
     heatmap = new google.maps.visualization.HeatmapLayer({
         data: pointArray,
         maxIntensity: 200,
         opacity: .7,
         radius: getNewRadius(currentZoom)
     });
     heatmap.setMap(map);
   });

}

function updateHeatMapData(numberOfDaysBack){
  stopLoading("dateLoader");
  console.log("Data Exists, Setting Data To Map");
  heatmap.set('data', serverData[numberOfDaysBack]);
}

function getServerData(numberOfDaysBack){
  // here i will call geocode and return the location on the
  // world so i know where to load the data for
  // SENSOR_COLLECTION_REGION_DATATYPE_JULIANDAY
  var jDate = getJulianDate(numberOfDaysBack);
  // Set up of the date formate
                //J1_VIIRS_C2_USA_contiguous_and_Hawaii_VJ114IMGTDL_NRT_2020241
  var csvToGet = "J1_VIIRS_C2_USA_contiguous_and_Hawaii_VJ114IMGTDL_NRT_"+jDate;
  console.log(csvToGet);
  if(serverData[numberOfDaysBack] == null) {
      csvJSON(csvToGet, function( handleData){
        rawServerData[numberOfDaysBack] = handleData;
        var preppedData = prepMapData(handleData, numberOfDaysBack);
        serverData[numberOfDaysBack] = preppedData;
        console.log("LoadMapData ServerData");
        if(intialLoad == true){
          console.log("InitalLoad");
          loadMapData(numberOfDaysBack);
        } else {
          updateHeatMapData(numberOfDaysBack);
        }
      });
    }
    else {
      // data is in array and can be loaded into map
      updateHeatMapData(numberOfDaysBack);
    }

}

function showDynamicDataFromDate(daysFromToday){
    startLoading("dateLoader");
    getServerData(daysFromToday);

}

function showDynamicDataFromTime(time, daysFromToday){
  var preSortedData = rawServerData[daysFromToday];
  var data = JSON.parse(preSortedData);
  var timesForThatDay = allowedTimed[daysFromToday];
  var timeValue = document.getElementById("timeRange");
  timeValue.max = timesForThatDay.length - 1;

  formatTimeForView(timesForThatDay[time]);

  console.log(timesForThatDay);

  prepTimeDataForHeatMap(timesForThatDay[time], data);
}

function prepTimeDataForHeatMap(time, data){
  console.log(time);
  var returnData = [];
  for (i = 0; i < data.length; i++) {
    if(data[i].acq_time.substr(0, 2) == time){
      var frp = 10 * data[i].frp;
      returnData.push(
        { location: new google.maps.LatLng(data[i].latitude, data[i].longitude), weight: frp }
      )
    }
  }
  heatmap.set('data', returnData);
}

function formatTimeForView(time){
  var dateValue = document.getElementById("timeValue");
  if(time > 12){
    time = time - 12;
    dateValue.innerHTML = time + " p.m.";
  } else {
    dateValue.innerHTML = time + " a.m.";
  }
}

function getNewRadius(zoom){
  console.log(zoom);

  console.log((.02 * Math.pow(2,(20-zoom))))
  return (.02 * Math.pow(2,zoom));

}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function setGradient() {
    gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ];
    heatmap.set('gradient', gradient);
}

function modulateGradient() {
    var modulator = function() {
        var newGradient = gradient.slice(0, heatmap.get('gradient').length + gradientStep);

        if (newGradient.length == gradient.length || newGradient.length == 7) {
            gradientStep *= -1;
        }

        heatmap.set('gradient', newGradient);

        setTimeout(modulator, 500);
    };

    setTimeout(modulator, 500);
}

function prepMapData(json, numberOfDaysBack){
  // console.log(json);
  var data = JSON.parse(json);
  var max = data.length;
  var returnData = [];
  var timeArray = [];
  for (i = 0; i < max; i++) {
      var frp = 10 * data[i].frp;
      if(!timeArray.includes(data[i].acq_time.substr(0, 2))){
        timeArray.push(data[i].acq_time.substr(0, 2));
      }
    returnData.push(
      { location: new google.maps.LatLng(data[i].latitude, data[i].longitude), weight: frp }
    )
  }
  allowedTimed[numberOfDaysBack] = timeArray;
  return returnData;
}

//var csv is the CSV file with headers
function csvJSON(dataString, handleData){
  $.ajax({
    url: "http://wildfirelocator.com/PHP/return_json_from_file.php?fileName="+dataString,
    // url: "../firedata/data.csv",
    async: true,
    success: function (data) {
        // console.log(csvd);
        // Used when a CSV was being used.
        //data = $.csv.toObjects(csvd);
        // will return data to user.
        handleData(data);
      }
  });
}

// Start of functions for getting data //
// returns formatted julian date
function getJulianDate(numberOfDaysBack){
  var dateValue = document.getElementById("dateValue");

  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);

  if(numberOfDaysBack >= 1){
    day = day - numberOfDaysBack;
  }
  var year = now.getFullYear();
  var yString = year.toString();

  var formatDate = new Date();
  formatDate.setDate(formatDate.getDate() - numberOfDaysBack);
  // formatting day for data viewport
  var dd = formatDate.getDate();
  var mm = formatDate.getMonth()+1;
  var yyyy = formatDate.getFullYear();
  todayformated = mm+'/'+dd+'/'+yyyy;
  dateValue.innerHTML = todayformated;
  return yString.concat(day);
}

function startLoading(id){
  var element = document.getElementById(id);
  element.style.display = "";
}

function stopLoading(id){
  var element = document.getElementById(id);
  element.style.display = "none";
}


// function getLocation() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(showPosition, cantGetLocation);
//   } else {
//     showMap(36.7783, -119.4179);
//   }
// }
//
// function showPosition(position) {
//   currentLat = position.coords.latitude;
//   currentLng = position.coords.longitude;
//   console.log(position);
//   showMap(currentLat, currentLng);
//
// }

// function cantGetLocation(){
//   showMap(36.7783, -119.4179);
// }