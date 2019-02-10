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
    const parseLyricsFromUrl = function (geniusUrl) {
        var proxyUrl = "https://cors-anywhere.herokuapp.com";
        var url = proxyUrl + "/" + geniusUrl;
        $.get(url, function( html ) {
            var lyrics = $(html).find("div").filter(".lyrics").text();
            $("#geniusContent").append("<pre>" + lyrics + "</pre>");
        });
    }

    // Access the Genius API for the search function and URL retrieval
    const showLyrics = function (obj) {
        var trackName = obj.item.name;
        var artistName = obj.item.artists[0].name;
        var albumUrl = obj.item.album.images[1].url;

        // Set the Spotify current song
        var currentTrackDisplay = "Current Song: " + artistName + " - " + trackName;
        $("#artistTitle").text(artistName);
        $("#trackTitle").text(trackName);
        $("#albumArtwork").attr("src", albumUrl);

        genius.getSearchFirstResult(trackName, artistName, function (url) {
            parseLyricsFromUrl(url);
        });

        setStyle(true);
    }

    // Checks for a hash in the URL and begins Spotify auth if so
    const readHash = () => {
        if (location.hash && location.hash !== "#") 
        {
            const data = location.hash.substring(1);
            var auth = spotify.parseAuth(data);
            if( auth !== null ) {
                spotify.getCurrentPlayback(function (response){
                    showLyrics(response);
                });
            }
        }
    }

    setStyle(false);
    spotify.spotify();
    readHash();
});