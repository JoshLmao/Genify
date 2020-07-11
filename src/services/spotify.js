import {
    SPOTIFY_CLIENT_ID,
    REQUEST_TIMEOUT_MS,
    PROXY_URL,
} from "../consts";

import axios from "axios";

const SpotifyService = {

    /// Returns the auth url to redirect the user to
    getUserAuthentificationUrl: function () {
        var respType = "token";
        var redirectUri = encodeURIComponent("http://localhost:3000/app"); //helper.isDevMode() ? encodeURIComponent(helper.getDevUrlPath()) : encodeURIComponent("https://genify.joshlmao.com");
        var scopes = [
            'streaming',
            'user-read-currently-playing',
            'user-read-playback-state',
            'user-modify-playback-state',
            'app-remote-control',
            'user-read-email',
            'user-read-private',
        ];
        var scopesEncoded = encodeURIComponent(scopes.join(' '));
        var apiUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=${respType}&redirect_uri=${redirectUri}&scope=${scopesEncoded}`;
        return apiUrl;
    },

    /// Parses url auth from Spotify
    parseAuth: function (authData) {
        var split = authData.split("&");
        if (split.length === 2 && split[0].substring(0, 4) === "error") {
            // Authorization was denied by user
            return false;
        } else {
            var authToken = split[0].split("=")[1];
            var tokenType = split[1].substring(611);
            var expiresSeconds = split[2].substring(11);

            let authExpireTime = this.getAuthExpireTime(expiresSeconds);

            // Save token info in cookies
            // cookies.setCookie("authToken", this.currentAuthToken);
            // cookies.setCookie("expireDate", this.authExpireTime);

            // Find ms difference between the expire time and now
            //var msDifference = authExpireTime - Date.now();
            // Require auth once it has expired
            // this.reauthThread = setTimeout(function() {
            //     spotify.reaquireAuth();
            // }, msDifference);


            var obj = {
                authToken: authToken,
                tokenType: tokenType,
                expireDate: authExpireTime,
            };
            return obj;
        }
    },

    // Gets the date plus the amount of seconds added on
    getAuthExpireTime: function (seconds) {
        return new Date(Date.now() + seconds * 1000);
    },

    /// Gets the current playback state of Spotify
    getCurrentPlaybackState: function (apiToken, callback) {
        var endpointUrl = "https://api.spotify.com/v1/me/player/";

        axios({
            method: 'GET',
            url: endpointUrl,
            headers: { 
                'Authorization': 'Bearer ' + apiToken,
            },
            timeout: REQUEST_TIMEOUT_MS,
        }).then(result => {
            if(callback) {
                callback(result.data);
                //console.log(result.data);
            }
        }).catch(error => {
            console.error(error);
        });
    },

    makeApiRequest: function (method, url, authToken, callback) {
        axios({
            method: method,
            url: url,
            headers: { 
                'Authorization': 'Bearer ' + authToken,
            },
            timeout: REQUEST_TIMEOUT_MS,
        }).then(result => {
            if(callback)
                callback(result.data);
        }).catch(error => {
            console.error(error);
        });
    },

    /// Pauses the current track
    pause: function (authToken) {
        let endpointUrl = PROXY_URL + "https://api.spotify.com/v1/me/player/pause";
        this.makeApiRequest("PUT", endpointUrl, authToken);
    },

    /// Plays the current track
    play: function(authToken) {
        let endpointUrl = PROXY_URL + "https://api.spotify.com/v1/me/player/play";
        this.makeApiRequest("PUT", endpointUrl, authToken);
    },

    /// Changes current track to the previous 
    previousTrack: function (authToken) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/player/previous";
        this.makeApiRequest("POST", url, authToken);
    },

    /// Skips to the next track
    nextTrack: function (authToken) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/player/next";
        this.makeApiRequest("POST", url, authToken);
    },

    /// Sets the current device's volume
    setVolume: function (authToken, volume) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/player/volume";
        url += "?volume_percent=" + volume;
        this.makeApiRequest("PUT", url, authToken);
    },

    /// Seeks to a certain ms position in the current song
    seek: function (authToken, positionMs) {
        let url  = PROXY_URL + "https://api.spotify.com/v1/me/player/seek";
        url += "?position_ms=" + positionMs;
        this.makeApiRequest("PUT", url, authToken);
    }

}

export default SpotifyService;