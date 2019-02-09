var spotify = function(){}

spotify.redirectUser = function () {
    var clientId = "f4dc97c399124fc99254c5d7ac2bf4bd";
    var respType = "token";
    var redirectUri = encodeURIComponent("https://genify.joshlmao.com");
    var scopes = encodeURIComponent('streaming');
    var apiUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=${respType}&redirect_uri=${redirectUri}&scope=${scopes}`;
 
    window.location.href = apiUrl;
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