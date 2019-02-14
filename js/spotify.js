callApi = function (endpointUrl, authToken, method, callback) {
    var proxyUrl = "https://cors-anywhere.herokuapp.com";
    var url = proxyUrl + "/" + endpointUrl;

    $.ajax({
        url: url,
        type: method ? method : "GET",
        headers: {
            'Authorization': 'Bearer ' + authToken,
        },
        success: function(response) {
            if( callback != null) {
                if ( response != undefined)
                    callback(response);
                else
                    console.error("Response from Spotify is undefined!");
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
        this.authExpireTime = {};
        this.updateSpotifyUIFunc = function(){};
    }

    // Gets the date plus the amount of seconds added on
    static getAuthExpireTime(seconds) {
        return new Date(Date.now() + seconds * 1000)
    }

    // Redirects the user to give auth to us
    static getUserAuth() {
        var clientId = "f4dc97c399124fc99254c5d7ac2bf4bd";
        var respType = "token";
        var redirectUri = encodeURIComponent("https://genify.joshlmao.com");
        var scopes = encodeURIComponent('streaming user-read-currently-playing user-read-playback-state user-modify-playback-state');
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
        } else {
            var authToken = split[0].substring(13);
            var tokenType = split[1].substring(11);
            var expiresSeconds = split[2].substring(11);

            this.currentAuthToken = authToken;
            this.authExpireTime = this.getAuthExpireTime(expiresSeconds);

            // Save token info in cookies
            cookies.setCookie("authToken", this.currentAuthToken);
            cookies.setCookie("expireDate", this.authExpireTime);

            var obj = {
                authToken: authToken,
                tokenType: tokenType,
                expiresSeconds: expiresSeconds
            };
            return obj;
        }
    }

    static startUpdateLoop(setUIFunc, geniusSearchFunc) {
        // Check song status every X milliseconds
        setInterval(() => {
            spotify.updateLoop(setUIFunc, geniusSearchFunc);
        }, 2 * 1000);
    }

    static loadAuth() {
        var expireDate = cookies.getCookie("expireDate");
        if (expireDate != "") {
            this.currentAuthToken = cookies.getCookie("authToken");
            return {
                expireDate: expireDate,
                authToken: this.currentAuthToken,
            };
        } else {
            console.error("No auth saved");
            return null;
        }
    }

    // Update loop run every X seconds, validates data and updates UI
    static updateLoop(setUIFunc, geniusSearchFunc) {
        this.getCurrentPlayback(function (data) {
            // Validate current playing track to make sure correct one is playing
            if( spotify.currentTrack == undefined || data == null) {
                return;
            }
            if ( data.trackName != spotify.currentTrack.trackName ||
                data.artistName != spotify.currentTrack.artistName ) {
                    spotify.currentTrack = data;
                    console.log(`Song updated | '${data.artistName} - ${data.trackName}`);

                    setUIFunc(data.trackName, data.artistName, data.albumArtUrl);
                    geniusSearchFunc(data.trackName, data.artistName, data.albumArtUrl);
            }
            
            // Validate Play state, update btn visibility
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

            // Validate that token info is still valid
            if ( Date.now() > (spotify.authExpireTime - (60 * 1000))) {
                // If token is less than 1 minute out of date, get user to give us auth again
                console.log("Reaquiring user authorization...");
                spotify.getUserAuth();
            }
        });
    }

    // Gets the current playback song of Spotify
    static getCurrentPlayback(callback) {
        var endpointUrl = "https://api.spotify.com/v1/me/player/";
        callApi(endpointUrl, this.currentAuthToken, "get", function (response) {
            if( response == undefined || response == null) {
                console.error("Unknown response from Playback call")
                return;
            }
            var trackData = {
                trackName: response.item.name,
                artistName: response.item.artists[0].name,
                albumArtUrl: response.item.album.images[1].url,
                
                isPlaying: response.is_playing,

                songUrl: response.item.external_urls.spotify,
                artistUrl: response.item.artists[0].external_urls.spotify,
            };
            if( spotify.currentTrack.trackName == null &&
                spotify.currentTrack.artistName == null) {
                spotify.currentTrack = trackData;

                $("#songLink").attr("href", trackData.songUrl); 
                $("#artistLink").attr("href", trackData.artistUrl);
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