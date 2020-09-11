// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:

var map, pointarray, heatmap; // Sets globals to heat map
var gradient, gradientStep = -1; // Keeping for when i add in gradient
var currentLat; // grabs the center lat and long on loading from the navigator
var currentLng;
var currentZoom = 7; // inital zoom value
// the data that been converted to google.maps location MVArray.
// Used to populate heatmap layer
var serverData = new Array(6);
var allowedTimed = new Array(6); // Checks the hours the data holders per day.
var rawServerData = new Array(6); // Raw Server data For faster loading when scrolling thorough days
var jsonServerData = new Array(6); // Not in use, Will take the place of server Data to be added and deduped for loading location based circles
var intialLoad = true; //  if the map as been loaded initally for knowing when to update the heat map layer
var bounds; //  bounds the map is currently showing (Lat and long)
var numberOfDaysBack = 0; // number of days into the past you are looking at (MAx of 7 currenty)

// First function to loads, Asks for current location
function getLocation(){
  if (navigator.geolocation) {
  return navigator.geolocation.getCurrentPosition(showPosition, cantGetLocation);
  } else {
    console.log("Get Location Not Available");
    cantGetLocation();
  }
}

// Will get cuurrent lat and long and load the map
function showPosition(position) {
  currentLat = position.coords.latitude;
  currentLng = position.coords.longitude;
  loadMapData(0);
}

// When you decline or the geolocation isnt available
function cantGetLocation(){
  currentLat = 36.7783;
  currentLng = -119.4179;
  loadMapData(0);
}

// Loads the inital Map data
// Takes the number of days into the past
function loadMapData(numberOfDaysBack){
  // Creates the map that is held in fireMap Div
  var mapOptions = {
      zoom: currentZoom,
      center: new google.maps.LatLng(currentLat, currentLng),
      mapTypeId: google.maps.MapTypeId.SATELLITE,
  };
  map = new google.maps.Map(document.getElementById('fireMap'), mapOptions);
  // Sets the heat map up with no data as the data is initally
  // pulled from the server
  heatmap = new google.maps.visualization.HeatmapLayer({
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
     // Makes sure the heatmap radius stays a constant size on the
     // map for better data visualization
       currentZoom = map.getZoom();
       heatmap.setOptions({
         opacity: .7,
         radius: getNewRadius(currentZoom)
       });
   });
   // When the map type changes is tosses out the overlay so we create a new one and add it
   google.maps.event.addListener(map, 'maptypeid_changed', function () {
     heatmap.setMap(null);
     currentZoom = map.getZoom();
     heatmap = new google.maps.visualization.HeatmapLayer({
         data: serverData[numberOfDaysBack],
         maxIntensity: 200,
         opacity: .7,
         radius: getNewRadius(currentZoom)
     });
     heatmap.setMap(map);
   });
   // Once the map has stopped moving we update the current screen bounds
   google.maps.event.addListener(map, 'idle', function(ev){
     bounds = map.getBounds();
   });
   // waits for map to load so we can send screen bounds to the server
   waitForMapToLoad();

}

// Calculates radius based on a 350 M circle for data points
function getNewRadius(zoom){
  return (.02 * Math.pow(2,zoom));
}

// waits for the map to load and then loads the lat and long so
// we can use that to get the correct data from the server.
function waitForMapToLoad(){
  if(typeof bounds !== "undefined"){
       getServerData(false, 0);
   }
   else{
       setTimeout(waitForMapToLoad, 250);
   }
}
// Updates the heatmap with the new data
function updateHeatMapData(numberOfDaysBack){
  stopLoading("dateLoader"); // stops small loader near data slider
  heatmap.set('data', serverData[numberOfDaysBack]);
}
// Calls the server data and buils the URL
function getServerData(zoomchanged, numberOfDaysBack){
  // Sets array bounds
  // var boundsURL = buildBoundsURL();
  // SENSOR_COLLECTION_REGION_DATATYPE_JULIANDAY
  var jDate = getJulianDate(numberOfDaysBack);
  // Set up of the date formate
                //J1_VIIRS_C2_USA_contiguous_and_Hawaii_VJ114IMGTDL_NRT_2020241
  var csvToGet = "J1_VIIRS_C2_USA_contiguous_and_Hawaii_VJ114IMGTDL_NRT_"+jDate;
  // if the data doesnt exist we will call for the new data
  if(serverData[numberOfDaysBack] == null) {
      csvJSON(csvToGet, function( handleData){
        // Raw server data is cached for the use in the time scroller
        rawServerData[numberOfDaysBack] = handleData;
        // Parse the data to be converted to google.location MVArray
        var preppedData = prepMapData(handleData, numberOfDaysBack);
        serverData[numberOfDaysBack] = preppedData;
        // updates Heatmap layer
        updateHeatMapData(numberOfDaysBack);
      });
    }else {
      // data is in array and can be loaded into map
      updateHeatMapData(numberOfDaysBack);
    }
}

// Creates the url for getting bounds data
function buildBoundsURL(){
  var ne = bounds.getNorthEast(); // LatLng of the north-east corner
  var sw = bounds.getSouthWest(); // LatLng of the south-west corder
  var nw = new google.maps.LatLng(ne.lat(), sw.lng());

  return  "&nelon="+ne.lng()+
          "&swlat="+sw.lat()+
          "&nwlat="+nw.lat()+
          "&nwlon="+nw.lng();
}
// When the slider changes date the data is checked if it exists
// and then either called for or updates the heatmap
function showDynamicDataFromDate(daysFromToday){
    startLoading("dateLoader");
    numberOfDaysBack = daysFromToday;
    if(serverData[numberOfDaysBack] == null){
      getServerData(false, daysFromToday);
    } else {
      updateHeatMapData(daysFromToday);
    }
}
// NOT IN USE
// Shows hour by hour updates of fires
function showDynamicDataFromTime(time, daysFromToday){
  // Data to show for the hour
  var data = JSON.parse(rawServerData[daysFromToday]);
  // times where the data has been updated in the day
  var timesForThatDay = allowedTimed[daysFromToday];
  // Update the time value for user view
  var timeValue = document.getElementById("timeRange");
  timeValue.max = timesForThatDay.length - 1;
  // Formates from military to std view
  formatTimeForView(timesForThatDay[time]);
  // data is prepped differntly, Contains time constraint
  prepTimeDataForHeatMap(timesForThatDay[time], data);
}
// Loads the values for the time data to be updated
function prepTimeDataForHeatMap(time, data){
  var returnData = [];
  for (i = 0; i < data.length; i++) {
    if(data[i].acq_time.substr(0, 2) == time){
      // value of how hot the fires are (NASA Calculated)
      var frp = 10 * data[i].frp;
      returnData.push(
        { location: new google.maps.LatLng(data[i].latitude, data[i].longitude), weight: frp }
      )
    }
  } // Sets the data directly using a calculated data set
  heatmap.set('data', returnData);
}

// Formates the time for the user view
function formatTimeForView(time){
  var dateValue = document.getElementById("timeValue");
  if(time > 12){
    time = time - 12;
    dateValue.innerHTML = time + " p.m.";
  } else {
    dateValue.innerHTML = time + " a.m.";
  }
}

// Preps data for view in heatmap MVArray
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
    type: "GET",
    // url: "../firedata/data.csv",
    async: true,
    success: function (data) {
        handleData(data);
      }
  });
}

// Start of functions for getting data
// returns formatted julian date
// Not Very fun to make, Julian dates are not fun....
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
