

var lightsControl = lightsControl || {}

lightsControl.version = 1.2

lightsControl.activateHueLibrary = function(){
  lightsControl.hue = jsHue()
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
      lightsControl.targetBridgeIP = bridges[0].internalipaddress
    }

    lightsControl.domViews.refreshBridgeElement()
    lightsControl.domViews.refreshAuthenticationElement()
  } )
}


// (requires link button to be pressed)
lightsControl.identify = function(){
  console.log( 'identify device' )
  lightsControl.targetBridge = lightsControl.hue.bridge( lightsControl.targetBridgeIP )

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
      console.log( username )
      lightsControl.targetBridgeUser = lightsControl.targetBridge.user( username )
    }


    lightsControl.domViews.refreshAuthenticationElement()
  } )

  lightsControl.domViews.refreshAuthenticationElement()
}


lightsControl.changeLightState = function(){
  lightsControl.targetBridgeUser.setLightState(1, { on: true } ).then(data => {
    // process response data, do other things
  })
}