/// Social Links
/// Twitter
export const TWITTER_LINK = "https://twitter.com/JoshLmao";
/// Repository github link
export const GITHUB_LINK = "https://github.com/JoshLmao/Genify";


/* Spotify API & related params */
/// Client ID required for Spotify auth
export const SPOTIFY_CLIENT_ID = "";
/// A code verifier for the PKCE auth method
/// https://tonyxu-io.github.io/pkce-generator/
export const SPOTIFY_CODE_VERIFIER = "";


/* Genius API */
/// Access token for using Genius web api
export const GENIUS_ACCESS_TOKEN = "";


/// Time in ms for all web requests with no response to timeout
export const REQUEST_TIMEOUT_MS = 30000;
/// Time in ms that the Spotify player updates its play state
export const PLAYER_UPDATE_MS = 2000;
/// Time in minutes to refresh the user auth before it expires
export const SPOTIFY_REFRESH_MINUTES = 3;

/// Proxy URL to use to aviod CORS issue
export const PROXY_URL = "https://genify-proxy.fly.dev/";
/// Mirror Homepage property in package.json. Used in services when can't access it
export const HOMEPAGE = "https://genify.joshlmao.com";