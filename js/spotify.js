var spotify = function(){}

spotify.redirectUser = function () {
    var clientId = "f4dc97c399124fc99254c5d7ac2bf4bd";
    var respType = "token";
    var redirectUri = encodeURIComponent("https://genify.joshlmao.com");
    var scopes = encodeURIComponent('streaming');
    var apiUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=${respType}&redirect_uri=${redirectUri}&scope=${scopes}`;
 
    window.location.href = apiUrl;
}