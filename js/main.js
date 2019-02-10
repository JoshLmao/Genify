$(() => {
    const getSpotify = () => {
        spotify.redirectUser();
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

        var currentTrackDisplay = "Current Song: " + artistName + " - " + trackName;
        $("#spotifyContent").append(currentTrackDisplay);

        var proxyUrl = "https://cors-anywhere.herokuapp.com/";
        var url = proxyUrl + "https://api.genius.com/search?q=" + encodeURIComponent(artistName) + "%20" + encodeURI(trackName);
        var accessToken = 'oIRErfK8KcmhxvvKzaDnt9GYLkfghdCz7pXxVi7Ce8c3V4INQC3qd_Djlc4ndnNq';
        $.ajax({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {
                if ( response != null ) {
                    var firstHit = response.response.hits[0];
                    var url = firstHit.result.url;
                    parseLyricsFromUrl(url);
                }
            },
            error: function(response) {
                console.error("Unable to get lyrics from Genius - " + response);
            },
        });

        setStyle(true);
    }

    // Checks for a hash in the URL and begins Spotify auth if so
    const readHash = () => {
        if (location.hash && location.hash !== "#") 
        {
            const raw_data = location.hash.substring(1);          
            var split = raw_data.split("&");
            var authToken = split[0].substring(13);
            var tokenType = split[1].substring(11);
            var expiresSeconds = split[2].substring(11);

            spotify.getCurrentPlayback(authToken, function (response){
                showLyrics(response);
            });
        }
    }

    setStyle(false);
    readHash();
});