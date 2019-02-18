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
        cookies.deleteAllCookies();
        window.location.href = "https://genify.joshlmao.com";
    });

    // Set the site version number for help
    $("#versionNumber").text("v0.1.02");

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

    // Starts search into Genius for lyrics, updates UI
    const doGeniusSearch = function (trackName, artistName) {
        // Reset loading spinner & lyrics text
        $("#geniusLoading").show();
        $("#geniusLyricsContent").text(null);

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
        var auth = null;
        if (location.hash && location.hash !== "#") 
        {
            // Store Spotify parameter data and remove from URL
            const data = location.hash.substring(1);
            var baseUrl = window.location.href.split("#")[0];
            window.history.pushState('name', '', baseUrl);

            auth = spotify.parseAuth(data);
            console.log("Loaded auth from url parameters");
        } else if ( cookies.checkCookie("authToken") == true ) {
            auth = spotify.loadAuth();

            if (Date.now() > auth.expireDate ) {
                $("#howToUse").before(`<div class="alert alert-danger text-center" role="alert">Lost Spotify authentification! Please re-sign in in to continue</div>`);
                console.log("Has old authentification. User needs to re-authenticate");
                auth = null;
            } else if ( auth != null ) {
                console.log("Loaded auth from cookies");
            } else {
                console.error("No authentification loaded from cookies");
            }
        }
        if( auth !== null ) {
            // Load current playing
            $("#signInBtnSignInContent").hide();
            $("#signInBtnLoadingContent").show();

            spotify.getCurrentPlayback(function (data) {
                setSpotifyUI(data.trackName, data.artistName, data.albumArtUrl);
                doGeniusSearch(data.trackName, data.artistName);
                
                spotify.startUpdateLoop(setSpotifyUI, doGeniusSearch);

                setStyle(true);
            });
        } else {
            $("#signInBtnSignInContent").show();
            $("#signInBtnLoadingContent").hide();
            console.error("Unable to begin initialization");
        }
    }

    setStyle(false);
    spotify.spotify(setSpotifyUI, doGeniusSearch);
    readHash();
});