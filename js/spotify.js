callApi = function (endpointUrl, authToken, method, callback) {
    var proxyUrl = "https://cors-anywhere.herokuapp.com";
    var url = proxyUrl + "/" + endpointUrl;

    $.ajax({
        url: url,
        type: method ? method : "GET",
        headers: {
            'Authorization': 'Bearer ' + authToken
        },
        success: function(response) {
            if( callback != null ) {
                callback(response);
            }
        },
        fail: function () {
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

        this.currentTrack = {
            trackName: null,
            artistName: null,
            albumArtUrl: null,
        };
        this.currentAuthToken = {};
        this.updateSpotifyUIFunc = function(){};
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
            
            // Check song status every X milliseconds
            setInterval(() => {
                spotify.updateLoop();
            }, 1000);

            var obj = {
                authToken: authToken,
                tokenType: tokenType,
                expiresSeconds: expiresSeconds
            };
            return obj;
        }
    }

    // Update loop run every X seconds, validates data and updates UI
    static updateLoop() {
        this.getCurrentPlayback(function (data) {
            if( spotify.currentTrack == undefined || data == null) {
                return;
            }
            if ( data.trackName != spotify.currentTrack.trackName &&
                data.artistName != spotify.currentTrack.artistName ) {
                    spotify.currentTrack = data;
                    console.log(`New Song - ${data.trackName}`);

                    spotify.updateSpotifyUIFunc(data.trackName, data.artistName, data.albumArtUrl);
                    spotify.geniusUpdateFunc(data.trackName, data.artistName, data.albumArtUrl);
            }
            
            if ( data.isPlaying ) {
                if ( !$("#pauseBtn").is(":visible")) { 
                    $("#pauseBtn").show();
                }
                if ( $("#playBtn").is(":visible") ) {
                    $("#playBtn").hide();
                }
            } else {
                if ( $("#pauseBtn").is(":visible")) { 
                    $("#pauseBtn").hide();
                }
                if ( !$("#playBtn").is(":visible") ) {
                    $("#playBtn").show();
                }   
            }
        });
    }

    // Gets the current playback song of Spotify
    static getCurrentPlayback(callback) {
        var endpointUrl = "https://api.spotify.com/v1/me/player/";
        callApi(endpointUrl, this.currentAuthToken, "GET", function (response) {
            var trackData = {
                trackName: response.item.name,
                artistName: response.item.artists[0].name,
                albumArtUrl: response.item.album.images[1].url,

                isPlaying: response.is_playing,
            };
            if( spotify.currentTrack.trackName == null &&
                spotify.currentTrack.artistName == null) {
                spotify.currentTrack = trackData;
            }
            callback(trackData);
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
        callApi(apiUrl, this.currentAuthToken, "POST", null);
    }
}




