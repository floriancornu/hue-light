// Testing Hue API

var hueControllerApp = {
  bridgeIP: '192.168.1.1', // Find at https://discovery.meethue.com/ or better https://www.meethue.com/api/nupnp
  bridgeUser: 'asb' //
}

// NOT WORKING DUE TO CROSS ORIGINS
// function findBridgeIP(){
//   if (window.XMLHttpRequest){
//     var endpointURL = 'https://discovery.meethue.com/'
//     var http = new XMLHttpRequest()
//     http.open( 'GET', endpointURL, true)

//     http.onreadystatechange = function()
//     {
//       if(http.readyState == 4)
//       {
//         if(http.status==200)
//         {
//           console.log( JSON.stringify(JSON.parse(http.responseText), null, '\t') )
//         }
//         else
//         {
//           console.log( 'Error:' + http.status )
//         }
//       }
//     }
//     http.send( '' )
//   }
//   return false
// }



function makeBaseURL(){
  var baseURL = 'https://'
  return baseURL + hueControllerApp.bridgeIP
}

function makeEndpointUrl( params ){
  let url = params.endpoint

  if( params.user ) url = url + '/' + params.user
  if( params.endpoint2 ) url = url + '/' + params.endpoint2

  return url
}

function callBridgeEndpoint( params ) {
  if (window.XMLHttpRequest) {

    var endpointURL = makeBaseURL() + makeEndpointUrl( params )
    var http = new XMLHttpRequest()
    http.open(params.command, endpointURL, true)

    http.onreadystatechange = function(){
      if(http.readyState == 4){
        if(http.status==200){
          console.log( JSON.stringify(JSON.parse(http.responseText), null, '\t') )
        }else{
          console.log( 'Error:' + http.status )
        }
      }
    }
    http.send( JSON.stringify( params.body ) )
  }
  return false
}


function returnLightState( params ){
  var stateRequestParams = {
    command: 'GET',
    endpoint: '/api',
    user: params.user,
    endpoint2: 'lights/1',
    body: {}
  }

  if (window.XMLHttpRequest){
    var endpointURL = makeBaseURL() + makeEndpointUrl( stateRequestParams )
    var http = new XMLHttpRequest()
    http.open(stateRequestParams.command, endpointURL, true)

    http.onreadystatechange = function(){
      if(http.readyState == 4){
        if(http.status==200){
          var responseJSON = JSON.parse(http.responseText)
          console.log( responseJSON.state )
        }else{
          console.log( 'Error:' + http.status )
        }
      }
    }
    http.send( JSON.stringify( params.body ) )
  }
  return false
}



/*
  params.sessions: [] // one or more integer of time to keep the color, in seconds; pass false to stop the loop, otherwise it goes back to first value
  params.colors: [{}] // one or more object of color to execute; will be looped endlessly
*/

var loopState = {
  sessionIndex: false,
  colorIndex: false,
  loopContinues: true
}
// Kill loop: loopState.loopContinues = false
var loopParams = {
  sessions: [540],
  // colors: [ { "xy": [ 0.675, 0.322 ] }, { "xy": [ 0.409, 0.518 ] }, { "xy": [ 0.167, 0.04 ] } ] // Red, Green, Blue
  colors: [ 
    { "xy": [0.25032663184399623, 0.13184493899325256] }, // VSS purple
    { "xy": [0.15036396889216824, 0.32447864428220274] }, // Future Flow dark green
    { "xy": [0.1467020424815871, 0.25434962712057735] }, // zenflow bright blue
    { "xy": [0.16627869628090167, 0.2324448482449628] }, // zenflow dark blue
    { "xy": [0.18756668922913694, 0.39497951082879207] } // Future Flow Green
  ]
}
function loopColors(){
  console.log( 'run loop function' )
  console.log( loopState.sessionIndex, loopState.colorIndex )
  
  Number.isFinite( loopState.sessionIndex )?  loopState.sessionIndex++ : loopState.sessionIndex = 0
  if( loopParams.sessions[ loopState.sessionIndex ] === false ){
    loopState.loopContinues = false
  }
  if( loopState.sessionIndex > loopParams.sessions.length - 1 ){
    loopState.sessionIndex = 0 // come back to start
  }

  Number.isFinite( loopState.colorIndex )?    loopState.colorIndex++ : loopState.colorIndex = 0
  if( loopState.colorIndex > loopParams.colors.length -1 ){
    loopState.colorIndex = 0 // come back to start
  }
  console.log( 'current loopState:', loopState )


  var oneColor = loopParams.colors[ loopState.colorIndex ]
  console.log( 'coming color:', oneColor )
  var bodyObj = Object.assign( { "on": true }, oneColor )
  var request = {
    command: 'PUT',
    endpoint: '/api',
    user: hueControllerApp.bridgeUser,
    endpoint2: 'lights/1/state',
    body: bodyObj
  }
  callBridgeEndpoint( request )

  if( loopState.loopContinues ){
    var timing = loopParams.sessions[ loopState.sessionIndex ] * 1000
    console.log( 'next change in', timing )
    window.setTimeout( loopColors, timing )
  }else{
    console.log( 'loop ends' )
  }
}


// Found in https://www.reddit.com/r/tasker/comments/4mzd01/using_rgb_colours_with_philips_hue_bulbs/
// The function below does the grunt work of creating an xy pair that produces
// colours equivalent to RGB colours.
function getXY(red,green,blue){

  if (red > 0.04045){
  red = Math.pow((red + 0.055) / (1.0 + 0.055), 2.4);
  }
  else red = (red / 12.92);
  
   if (green > 0.04045){
  green = Math.pow((green + 0.055) / (1.0 + 0.055), 2.4);
  }
  else green = (green / 12.92);
  
  if (blue > 0.04045){
  blue = Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4);
  }
  else blue = (blue / 12.92);
  
  var X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  var Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  var Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
  var x = X / (X + Y + Z);
  var y = Y / (X + Y + Z);
  return new Array(x,y);
}

// Send requests
/*
var request = {
  command: 'GET',
  endpoint: '/api/newdev',
  body: {}
}

Endpoints:
// Authenticating the Bridge: Send the request within a few seconds of pressing the bridge button
var request = {
  command: 'POST',
  endpoint: '/api',
  body: {"devicetype":"whatever name"}
}
-> Receives a username:
ABCDEF


// Get all lights
var request = {
  command: 'GET',
  endpoint: '/api',
  user: hueControllerApp.bridgeUser,
  endpoint2: 'lights',
  body: {}
}

// Get info about light <1>
var request = {
  command: 'GET',
  endpoint: '/api',
  user: hueControllerApp.bridgeUser,
  endpoint2: 'lights/1',
  body: {}
}

// Turn light on
var request = {
  command: 'PUT',
  endpoint: '/api',
  user: hueControllerApp.bridgeUser,
  endpoint2: 'lights/1/state',
  body: { "on": true }
}

// Change colors
// Colors are defined in xy C.I.E. Chromaticity Diagram
// xy: [0,0]
// ct: 153 // between 153 (pure white) to 500 (yellow white)
// hue & sat: 25 // between 25 (saturated) to 200 (white)
// In case of multiple params: xy beats ct beats hue, sat

// also: bri 

// https://developers.meethue.com/develop/application-design-guidance/color-conversion-formulas-rgb-to-xy-and-back/
// Red: 0.675, 0.322
// Green: 0.409, 0.518
// Blue: 0.167, 0.04

// Basics:
// Red: 1.0, 0
// Green: 0.0, 1.0
// Blue: 0.0, 0.0

var request = {
  command: 'PUT',
  endpoint: '/api',
  user: hueControllerApp.bridgeUser,
  endpoint2: 'lights/1/state',
  body: { "on": true, "sat":254, "bri":254,"hue":10000 }
}
*/
