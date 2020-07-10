import {
    SPOTIFY_CLIENT_ID,
    REQUEST_TIMEOUT_MS
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
        return new Date(Date.now() + seconds * 1000)
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
}

export default SpotifyService;