var lightsControl = lightsControl || {}

lightsControl.version = 1.8

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
  lightsControl.domViews.refreshLoopElements()
}



lightsControl.findBridge = function(){
  console.log( 'finding Bridge' )
  lightsControl.hue.discover().then( function( bridges ){
    if( bridges.length === 0 ){
      console.warn( 'no Hue Bridges found' )
    }else{
      bridges.forEach( function( oneBridge ){
        console.log( 'Bridge found at IP address: ', oneBridge.internalipaddress )
      } )

      // Use the first bridge
      let currentBridgeIP = bridges[0].internalipaddress
      let previousBridgeIP = localStorage.getItem('bridgeIP')
      if( previousBridgeIP !== currentBridgeIP ){
        console.warn( 'bridge IP changed from ', previousBridgeIP, ' to ', currentBridgeIP )
      }

      // Update settings
      localStorage.setItem('bridgeIP', currentBridgeIP )
      lightsControl.targetBridgeIP = currentBridgeIP
    }

    lightsControl.refreshUI()
  } )
}

lightsControl.forgetBridge = function(){
  localStorage.removeItem( 'bridgeIP' )
  lightsControl.targetBridgeIP = false
  lightsControl.forgetUser()

  lightsControl.refreshUI()
}

lightsControl.forgetUser = function(){
  localStorage.removeItem( 'username' )
  lightsControl.targetUsername = false

  lightsControl.refreshUI()
}


// (requires link button to be pressed)
lightsControl.identify = function(){
  console.log( 'identify device', lightsControl.targetBridgeIP )
  lightsControl.targetBridge = lightsControl.hue.bridge( lightsControl.targetBridgeIP )

  console.log( 'bridge?', lightsControl.targetBridge, JSON.stringify( lightsControl.targetBridge ) )

  // Generate a random ID
  let deviceId = Math.round( Math.random()*10000000 )

  lightsControl.targetBridge.createUser( 'browserApp' + deviceId ).then( function( data ){
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
  .catch( function( e ){
    console.log( 'caught', e)

    lightsControl.identificationStatus = {}
    lightsControl.identificationStatus.errorText = 'Unable to process the request :('
    lightsControl.refreshUI()
  })

  lightsControl.refreshUI()
}


/*
  {on: true}
  {on: false}
  {on:true, xy: [0,1]}
*/
lightsControl.changeLightState = function( lightState ){
  if( !lightsControl.targetBridgeUser ){
    lightsControl.useLocalAuthentication()

    lightsControl.refreshUI()
  }

  lightsControl.targetBridgeUser.setLightState(1, lightState ).then(data => {
    // process response data, do other things
  })
}