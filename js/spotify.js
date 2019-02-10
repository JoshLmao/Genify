var spotify = function(){}

spotify.currentAuthToken = null;

spotify.redirectUser = function () {
    var clientId = "f4dc97c399124fc99254c5d7ac2bf4bd";
    var respType = "token";
    var redirectUri = encodeURIComponent("https://genify.joshlmao.com");
    var scopes = encodeURIComponent('streaming');
    var apiUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=${respType}&redirect_uri=${redirectUri}&scope=${scopes}`;
 
    window.location.href = apiUrl;
}

spotify.parseAuth = function (data) {
    var split = data.split("&");

    if( split.length == 2 && split[0].substring(0, 4) == "error") {
        // Auth was denied
        console.log("User denied auth");
        return null;
    } else {
        var authToken = split[0].substring(13);
        var tokenType = split[1].substring(11);
        var expiresSeconds = split[2].substring(11);
        
        spotify.currentAuthToken = authToken;

        var obj = {
            authToken: authToken,
            tokenType: tokenType,
            expiresSeconds: expiresSeconds
        };
        return obj;
    }
}

spotify.getCurrentPlayback = function (authToken, callback) {
    var endpointUrl = "https://api.spotify.com/v1/me/player/" ;
    var proxyUrl = "https://cors-anywhere.herokuapp.com";
    var url = proxyUrl + "/" + endpointUrl;

    $.ajax({
        url: url,
        headers: {
            'Authorization': 'Bearer ' + authToken
        },
        success: function(response) {
            callback(response);
        },
    });
}