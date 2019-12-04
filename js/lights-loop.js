
var lightsControl = lightsControl || {}
lightsControl.loop = {}

lightsControl.loop.timeouts = []

lightsControl.loop.loopState = {
  sessionIndex: false,
  colorIndex: false,
  loopContinues: true
}
lightsControl.loop.loopParams = {
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

lightsControl.loop.loopColors = function(){
  console.log( 'run loop function' )
  console.log( lightsControl.loop.loopState.sessionIndex, lightsControl.loop.loopState.colorIndex )
  
  Number.isFinite( lightsControl.loop.loopState.sessionIndex )?  lightsControl.loop.loopState.sessionIndex++ : lightsControl.loop.loopState.sessionIndex = 0
  if( lightsControl.loop.loopParams.sessions[ lightsControl.loop.loopState.sessionIndex ] === false ){
    lightsControl.loop.loopState.loopContinues = false
  }
  if( lightsControl.loop.loopState.sessionIndex > lightsControl.loop.loopParams.sessions.length - 1 ){
    lightsControl.loop.loopState.sessionIndex = 0 // come back to start
  }

  Number.isFinite( lightsControl.loop.loopState.colorIndex )?    lightsControl.loop.loopState.colorIndex++ : lightsControl.loop.loopState.colorIndex = 0
  if( lightsControl.loop.loopState.colorIndex > lightsControl.loop.loopParams.colors.length -1 ){
    lightsControl.loop.loopState.colorIndex = 0 // come back to start
  }
  console.log( 'current lightsControl.loop.loopState:', lightsControl.loop.loopState )


  var oneColor = lightsControl.loop.loopParams.colors[ lightsControl.loop.loopState.colorIndex ]
  console.log( 'coming color:', oneColor )
  var bodyObj = Object.assign( { "on": true }, oneColor )
  lightsControl.changeLightState( bodyObj )

  
  if( lightsControl.loop.loopState.loopContinues ){
    var timing = lightsControl.loop.loopParams.sessions[ lightsControl.loop.loopState.sessionIndex ] * 1000
    console.log( 'next change in', timing )

    lightsControl.loop.clearTimeouts()
    let timeoutId = window.setTimeout( lightsControl.loop.loopColors, timing )
    lightsControl.loop.timeouts.push( timeoutId )
  }else{
    console.log( 'loop ends' )
  }
}

lightsControl.loop.clearTimeouts = function(){
  lightsControl.loop.timeouts.forEach( function( oneTimeout ){
    window.clearTimeout( oneTimeout )
  } )
  lightsControl.loop.timeouts = []
}

lightsControl.loop.stopLoop = function(){
  lightsControl.loop.loopState.loopContinues = false
  lightsControl.loop.clearTimeouts()
}