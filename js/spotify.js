var spotify = function(){}

spotify.getCredentials = function () {
    var clientId = "f4dc97c399124fc99254c5d7ac2bf4bd";
    var respType = "code";
    var redirectUri = "http://localhost:8000";
    var url = `https://accounts.spotify.com/authorize?client_id=${clientId}$response_type=${respType}%redirect_uri=${redirectUri}`;
    
    $.getJSON(`https://curl.io/?${url}`, function (response) {
        console.log(`resp is ${response}`);
    });

    // hitApi(`https://curl.io/?${url}`, function(error, json) {
    //     if (error) 
    //     {
    //         console.log('there was an error', error);
    //     }
    //     else 
    //     {
    //         console.log('data is', data);
    //     }
    // });
}

function hitApi(url, callback) {
    var req = new XMLHttpRequest();
  
    req.addEventListener('load', onLoad);
    req.addEventListener('error', onFail);
    req.addEventListener('abort', onFail);
  
    req.open('GET', url);
    req.send();
  
    function onLoad(event) {
      if (req.status >= 400) {
        onFail(event);
      } else {
        var json = JSON.parse(this.responseText);
        callback(null, json);
      }
    }
  
    function onFail(event) {
      callback(new Error('...'));
    }
  }