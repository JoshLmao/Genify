callApi = function (endpointUrl, authToken, method, successCallback) {
    var proxyUrl = "https://cors-anywhere.herokuapp.com";
    var url = proxyUrl + "/" + endpointUrl;

    $.ajax({
        url: url,
        type: method ? method : "GET",
        headers: {
            'Authorization': 'Bearer ' + authToken
        },
        success: function(response) {
            successCallback(response);
        },
        fail: function () {
            debugger;
            console.log("failed");
        }
    });
}

class spotify {
    static spotify() {
        $("#pauseBtn").click(() => {
            spotify.pause();
        });
        $("#playBtn").click(() => {
            spotify.play();
        });
        $("#previousBtn").click(() => {
            spotify.previousSong();
        });
        $("#nextBtn").click(() => {
            spotify.nextSong();
        });

        $("#playBtn").hide();
    }

    // Redirects the user to give auth to us
    static getUserAuth() {
        var clientId = "f4dc97c399124fc99254c5d7ac2bf4bd";
        var respType = "token";
        var redirectUri = encodeURIComponent("https://genify.joshlmao.com");
        var scopes = encodeURIComponent('streaming');
        var apiUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=${respType}&redirect_uri=${redirectUri}&scope=${scopes}`;
        window.location.href = apiUrl;
    }

    // Parses the auth data from the url
    static parseAuth(data) {
        var split = data.split("&");
        if (split.length == 2 && split[0].substring(0, 4) == "error") {
            // Auth was denied
            console.log("User denied auth");
            return null;
        }
        else {
            var authToken = split[0].substring(13);
            var tokenType = split[1].substring(11);
            var expiresSeconds = split[2].substring(11);
            this.currentAuthToken = authToken;
            var obj = {
                authToken: authToken,
                tokenType: tokenType,
                expiresSeconds: expiresSeconds
            };
            return obj;
        }
    }

    // Gets the current playback song of Spotify
    static getCurrentPlayback(callback) {
        var endpointUrl = "https://api.spotify.com/v1/me/player/";
        callApi(endpointUrl, this.currentAuthToken, "GET", function (response) {
            callback(response);
        });
    }

    // Pauses the current Spotify song
    static pause () {
        var apiUrl = "https://api.spotify.com/v1/me/player/pause";
        callApi(apiUrl, this.currentAuthToken, "PUT", null);

        $("#pauseBtn").hide();
        $("#playBtn").show();
    }

    // Plays the current Spotify song
    static play () {
        var apiUrl = "https://api.spotify.com/v1/me/player/play";
        callApi(apiUrl, this.currentAuthToken, "PUT", null);

        $("#playBtn").hide();
        $("#pauseBtn").show();
    }

    // Skips playback to the next song
    static nextSong () {
        var apiUrl = "https://api.spotify.com/v1/me/player/next";
        callApi(apiUrl, this.currentAuthToken, "POST", null);
    }

    // Skips playback to the previous song
    static previousSong () {
        var apiUrl = "https://api.spotify.com/v1/me/player/previous";
        callApi(apiUrl, this.currentAuthToken, "POST", nul);
    }
}




