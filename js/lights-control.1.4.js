var lightsControl = lightsControl || {}

lightsControl.version = 1.4

lightsControl.activateHueLibrary = function(){
  lightsControl.hue = jsHue()
}


lightsControl.useLocalAuthentication = function(){
  lightsControl.targetBridgeIP = localStorage.getItem('bridgeIP')
  lightsControl.targetUsername = localStorage.getItem('username')

  if( lightsControl.targetBridgeIP ){
    console.log( 'targetBridgeIP known', lightsControl.targetBridgeIP )
    lightsControl.targetBridge = lightsControl.hue.bridge( lightsControl.targetBridgeIP )
  }

  if( lightsControl.targetBridge && lightsControl.targetUsername ){
    console.log( 'bridge username known', lightsControl.targetUsername )
    lightsControl.targetBridgeUser = lightsControl.targetBridge.user( lightsControl.targetUsername )
    console.log( lightsControl.targetBridgeUser )
  }
}

lightsControl.refreshUI = function(){
  lightsControl.domViews.refreshBridgeElement()
  lightsControl.domViews.refreshAuthenticationElement()
  lightsControl.domViews.refreshLightsElements()
}


lightsControl.findBridge = function(){
  console.log( 'finding Bridge' )
  lightsControl.hue.discover().then( function( bridges ){
    if( bridges.length === 0 ){
      console.warn( 'no Hue Bridges found' )
    }else{
      bridges.forEach( function( oneBridge ){
        console.log( 'Bridge found at IP address %s.', oneBridge.internalipaddress )
      } )

      // Use the first bridge
      localStorage.setItem('bridgeIP', bridges[0].internalipaddress)
      lightsControl.targetBridgeIP = bridges[0].internalipaddress
    }

    lightsControl.refreshUI()
  } )
}


// (requires link button to be pressed)
lightsControl.identify = function(){
  console.log( 'identify device', lightsControl.targetBridgeIP )
  lightsControl.targetBridge = lightsControl.hue.bridge( lightsControl.targetBridgeIP )

  console.log( 'bridge?', lightsControl.targetBridge, JSON.stringify( lightsControl.targetBridge ) )

  lightsControl.targetBridge.createUser( 'browserApp' ).then( function( data ){
    console.log( 'authentication data', data )

    lightsControl.identificationStatus = {}

    if( data[0].error ){
      lightsControl.identificationStatus.error = data[0].error
      if( data[0].error.type === 101 ){
        lightsControl.identificationStatus.errorText = 'Press the Bridge button and try again'
      }
    }else{
      lightsControl.identificationStatus.error = false


      var username = data[0].success.username
      localStorage.setItem('username', username)
      lightsControl.targetUsername = username

      console.log( username )
      // lightsControl.targetBridgeUser = lightsControl.targetBridge.user( username )
    }

    lightsControl.refreshUI()
  } )

  lightsControl.refreshUI()
}


/*
  {on: true}
  {on: false}
  {on:true, xy: [0,1]}
*/
lightsControl.changeLightState = function( lightState ){
  lightsControl.targetBridgeUser.setLightState(1, lightState ).then(data => {
    // process response data, do other things
  })
}