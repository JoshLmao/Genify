$(() => {
    const getSpotify = () => {
        spotify.getUserAuth();
    } 

    $("#btnSignIn").click(() => {
        console.log("Sign into Spotify");
        getSpotify();
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
        $("#geniusContent").append(lyricsText);
    }

    // Set the Spotify current track info UI
    const setSpotifyUI = function (artist, trackName, albumUrl) {
        $("#artistTitle").text(artist);
        $("#trackTitle").text(trackName);
        $("#albumArtwork").attr("src", albumUrl);
    }

    // Checks for a hash in the URL and begins Spotify auth if so
    const readHash = () => {
        if (location.hash && location.hash !== "#") 
        {
            const data = location.hash.substring(1);
            var auth = spotify.parseAuth(data);
            if( auth !== null ) {
                spotify.getCurrentPlayback(function (response) {
                    var trackName = response.item.name;
                    var artistName = response.item.artists[0].name;
                    var albumUrl = response.item.album.images[1].url;
                    setSpotifyUI(artistName, trackName, albumUrl);
                    
                    genius.getSearchFirstResult(trackName, artistName, function (url) {
                        genius.getLyricsFromUrl(url, function (lyrics) {
                            setLyrics(lyrics);
                        });
                    });

                    setStyle(true);
                });
            }
        }
    }

    setStyle(false);
    spotify.spotify();
    readHash();
});