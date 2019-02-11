$(() => {
    const getSpotify = () => {
        spotify.getUserAuth();
    } 

    $("#btnSignIn").click(() => {
        console.log("Signing into Spotify");
        getSpotify();
    });

    $("#btnSignOut").click(() => {
        console.log("Signing out of Spotify");
        window.location.href = "https://genify.joshlmao.com";
    });

    const setStyle = function (hasLyrics) {
        if ( hasLyrics === false ) {
            $(".hide-on-lyrics").show();
            $(".show-on-lyrics").hide();
        } else {
            $(".hide-on-lyrics").hide();
            $(".show-on-lyrics").show();
        }
    }

    // Parse the lyrics from the Genius URL
    const setLyrics = function (lyricsText) {
        $("#geniusLoading").hide();
        $("#geniusLyricsContent").text(lyricsText.trim());
    }

    // Set the Spotify current track info UI
    const setSpotifyUI = function (trackName, artistName, albumArtUrl) {
        $("#trackTitle").text(trackName);
        $("#artistTitle").text(artistName);
        $("#albumArtwork").attr("src", albumArtUrl);
    }

    const doGeniusSearch = function (trackName, artistName, getLyricsCallback) {
        genius.getSearchFirstResult(trackName, artistName, function (url) {
            getLyricsFromUrl(url);
        });
    }

    const getLyricsFromUrl = function (url) {
        genius.getLyricsFromUrl(url, function (lyrics) {
            setLyrics(lyrics);
        });
    }

    // Checks for a hash in the URL and begins Spotify auth if so
    const readHash = () => {
        if (location.hash && location.hash !== "#") 
        {
            // Store Spotify parameter data and remove from URL
            const data = location.hash.substring(1);
            var baseUrl = window.location.href.split("#")[0];
            window.history.pushState('name', '', baseUrl);

            var auth = spotify.parseAuth(data);
            if( auth !== null ) {
                spotify.getCurrentPlayback(function (data) {
                    setSpotifyUI(data.trackName, data.artistName, data.albumArtUrl);
                    doGeniusSearch(data.trackName, data.artistName)

                    setStyle(true);
                });
            }
        }
    }

    setStyle(false);
    spotify.spotify();
    spotify.updateSpotifyUIFunc = setSpotifyUI;
    spotify.geniusUpdateFunc = doGeniusSearch;
    readHash();
});