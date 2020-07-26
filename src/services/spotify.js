import {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CODE_VERIFIER,
    SPOTIFY_REFRESH_MINUTES,
    REQUEST_TIMEOUT_MS,
    PROXY_URL,
    HOMEPAGE,
} from "../consts";
import {
    isDev
} from "../helpers/devHelper";
import axios from "axios";
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import { urlEncodeData } from "../helpers/spotifyHelper";

const SpotifyService = {

    // Gets all the required scopes in Spotify that are required to enable all functionality
    getRequiredScopes: function () {
        let scopes = [
            'streaming',
            'user-read-currently-playing',
            'user-read-playback-state',
            'user-modify-playback-state',
            'app-remote-control',
            'user-read-email',
            'user-read-private',
            'user-top-read', // for reading/suggesting top tracks/artists
            'user-read-recently-played', // read recent played to suggest
        ];
        return scopes;
    },

    /// Generates an Spotify auth uri for the PKCE auth flow
    /// https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce
    getPKCEAuthUri: function () {
        let responseType = "code";
        let baseUrl = isDev() ? "http://localhost:3000" : HOMEPAGE;
        let redirectUri = encodeURIComponent(baseUrl + "/callback");
        let scopes = this.getRequiredScopes();
        let scopesEncoded = encodeURIComponent(scopes.join(' '));
        
        let challenge = this.encodePKCEChallenge(SPOTIFY_CODE_VERIFIER);
        let codeChallengeMethod = challenge.method;
        let codeChallenge = challenge.challenge;

        let appState = "genify-app";
        let params = [
            `response_type=${responseType}`,
            `client_id=${SPOTIFY_CLIENT_ID}`,
            `redirect_uri=${redirectUri}`,
            `code_challenge=${codeChallenge}`,
            `code_challenge_method=${codeChallengeMethod}`,
            `state=${appState}`,
            `scope=${scopesEncoded}`,
        ];

        let endpoint = "https://accounts.spotify.com/authorize";
        return endpoint + "?" + params.join("&");
    },

    /// Encodes a code verifier into a code challenge using SHA256, encoded into base64
    encodePKCEChallenge: function (verifier) {
        let sha = sha256(verifier);
        let base64 = Base64.stringify(sha).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        return {
            method: "S256",
            challenge: base64,
        };
    },

    /// Exchanges the PKCE code and responds with relevant encoded data
    /// Callback for handling recieving final Spotify auth
    exchangePKCECode: function (pkceCode, authCallback) {
        let baseUrl = isDev() ? "http://localhost:3000" : HOMEPAGE;
        let redirectUri = baseUrl + "/callback";

        let encodedBody = urlEncodeData({
            grant_type: encodeURIComponent('authorization_code'),
            client_id: encodeURIComponent(SPOTIFY_CLIENT_ID),
            code: encodeURIComponent(pkceCode),
            redirect_uri: redirectUri,
            code_verifier: encodeURIComponent(SPOTIFY_CODE_VERIFIER),
        });

        axios({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            data: encodedBody,
            timeout: REQUEST_TIMEOUT_MS,
        }).then(result => {
            if(authCallback)
                authCallback(result.data);
        }).catch(error => {
            console.error(error);
            console.error(error.response.data);
        });
    },

    /// Parses auth from Spotify into a better object
    parseAuth: function (data) {
        if(!data) {
            return null;
        }
        
        let expiresSeconds = data.expires_in;
        /// Uncomment following to debug refreshing auth and having stable site state
        // let minutes = 2;
        // expiresSeconds = (SPOTIFY_REFRESH_MINUTES * 60) + minutes * 60;
        let authExpireTime = this.getAuthExpireTime(expiresSeconds);
        let scopes = data.scope.split(' ');

        return {
            authToken: data.access_token,
            tokenType: data.token_type,
            scopes: scopes,
            refreshToken:  data.refresh_token,

            expireDate: authExpireTime,
        };
    },

    /// Refreshes old authentification using a refresh token
    /// Callback for handling recieveing new Spotify auth
    refreshAuth: function (refreshToken, authCallback) {
        if(refreshToken) {
            let encodedData = urlEncodeData({
                grant_type: encodeURIComponent("refresh_token"),
                refresh_token: refreshToken,
                client_id: encodeURIComponent(SPOTIFY_CLIENT_ID),
            });

            axios({
                method: 'POST',
                url: 'https://accounts.spotify.com/api/token',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                data: encodedData,
                timeout: REQUEST_TIMEOUT_MS,
            }).then(result => {
                if(authCallback)
                    authCallback(result.data);
            }).catch(error => {
               this.handleApiError(error);
            });
        }

        return null;
    },

    /// Debug with more info any API errors
    handleApiError: function (error, apiPath) {
        console.error(`Spotify API Error: '${apiPath}': '${error?.response?.data?.error?.message ?? error}'`);
    },

    // Gets the date plus the amount of seconds added on
    getAuthExpireTime: function (seconds) {
        return new Date(Date.now() + seconds * 1000);
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
            this.handleApiError(error, url);
        });
    },

    makeApiDataRequest: function (method, url, authToken, data, callback) {
        axios({
            method: method,
            url: url,
            headers: { 
                'Authorization': 'Bearer ' + authToken,
            },
            data: data,
            timeout: REQUEST_TIMEOUT_MS,
        }).then(result => {
            if(callback)
                callback(result.data);
        }).catch(error => {
            this.handleApiError(error, url);
        });
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
                if (result.status === 204) {
                    // no track playing
                    callback(null);
                } else {
                    callback(result.data);
                }
            }
        }).catch(error => {
            this.handleApiError(error, endpointUrl);
        });
    },

    /// Pauses the current track
    pause: function (authToken) {
        let endpointUrl = PROXY_URL + "https://api.spotify.com/v1/me/player/pause";
        this.makeApiRequest("PUT", endpointUrl, authToken);
    },

    /// Resumes the current track
    resume: function(authToken) {
        let endpointUrl = PROXY_URL + "https://api.spotify.com/v1/me/player/play";
        this.makeApiRequest("PUT", endpointUrl, authToken);
    },

    /// Plays a specific track uri on the target device
    playTrack: function (authToken, deviceId, trackUri) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/player/play";
        if(deviceId) {
            url += `?device_id=${deviceId}`;
        }
        this.makeApiDataRequest("PUT", url, authToken, {
            uris: [ trackUri ],
        });
    },

    /// Plays a valid context on the target device id. Valid context uri's include albums, artists & playlists
    /// trackPosition starts from 0 for first track
    playContext: function (authToken, deviceId, contextUri, trackPosition = 0, positionMs = 0) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/player/play";
        if(deviceId) {
            url += `?device_id=${deviceId}`;
        }
        this.makeApiDataRequest("PUT", url, authToken, {
            context_uri: contextUri,
            offset: {
                position: trackPosition
            },
            position_ms: positionMs,
        });
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
    },

    getPlaybackDevices: function (authToken, callback) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/player/devices";
        this.makeApiRequest("GET", url, authToken, callback)
    },

    setPlaybackDevice: function (authToken, targetDevice, play) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/player";
        let reqData = {
            device_ids: [ targetDevice ],
            play: play,
        };
        this.makeApiDataRequest("PUT", url, authToken, reqData);
    },

    getCurrentUserProfile: function (authToken, callback) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me";
        this.makeApiRequest("GET", url, authToken, callback);
    },

    /// Gets the users top tracks in the time frame. Time frame can be "long_term", "medium_term", "short_term"
    getUsersTopTracks: function (authToken, limit, timeFrame, callback) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/top/tracks?";
        if(limit > 0) {
            url += `limit=${limit}`;
        }
        if(timeFrame) {
            //long_term (several years), medium_term (6 months), short_term (4 weeks)
            url += `&time_range=${timeFrame}`;
        }
        this.makeApiRequest("GET", url, authToken, callback);
    },

    /// Gets the users top artists in the time frame. Time frame can be "long_term", "medium_term", "short_term"
    getUsersTopArtists: function (authToken, limit, timeFrame, callback) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/top/artists?";
        if(limit > 0) {
            url += `limit=${limit}`;
        }
        if(timeFrame) {
            //long_term (several years), medium_term (6 months), short_term (4 weeks)
            url += `&time_range=${timeFrame}`;
        }
        this.makeApiRequest("GET", url, authToken, callback);
    },

    getUsersRecentlyPlayed: function (authToken, limit, callback) {
        let url = PROXY_URL + "https://api.spotify.com/v1/me/player/recently-played";
        if(limit) {
            url += `?limit=${limit}`;
        }
        this.makeApiRequest("GET", url, authToken, callback);
    }
}

export default SpotifyService;