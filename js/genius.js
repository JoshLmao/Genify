class genius {

    static setNoLyricsUI() { 
        $("#geniusLoading").hide();
        $("#romanizeBtn").hide();
        $("#geniusAddLyrics").show();
        $("#geniusLyricsContent").text("Unable to find lyrics");
    }

    // Searches Genius for the artist and track name and returns the first result
    static getSearchFirstResult(trackData, callback) {
        var proxyUrl = "https://genify-proxy.herokuapp.com/";
        var url = proxyUrl + "https://api.genius.com/search?q=" + encodeURIComponent(trackData.artistName) + "%20" + encodeURI(trackData.trackName);
        var accessToken = 'oIRErfK8KcmhxvvKzaDnt9GYLkfghdCz7pXxVi7Ce8c3V4INQC3qd_Djlc4ndnNq';
        $.ajax({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {
                if ( response != null) {
                    if ( response.response.hits.length === 0) { 
                        console.error("Unable to find any Genius lyrics results");
                        genius.setNoLyricsUI();
                        return;
                    }
                    var hitResult = genius.getRelevantHit(response.response.hits, trackData);
                    callback(hitResult.url);
                }
            },
            error: function(response) {
                console.error("Unable to get lyrics from Genius - " + response);
                genius.setNoLyricsUI();
            },
        });
    }

    // Gets the lyrics from the Genius URL page
    static getLyricsFromUrl(url, callback) {
        var proxyUrl = "https://genify-proxy.herokuapp.com";
        var url = proxyUrl + "/" + url;
        $.get(url, function( html ) {
            var lyrics = $(html).find("div").filter(".lyrics").text();
            callback(lyrics);
        });
    }

    // Gets the most appropriate hit in the list
    static getRelevantHit (hits, trackData) {
        if(hits.length == 0 || trackData == undefined) {
            return null;
        }
        // find the first hit that contains song name in full_name
        var relevantHit = null;
        for (var i = 0; i < hits.length; i++ ) {
            if (hits[i].result.full_title.includes(trackData.trackName) 
            && hits[i].result.primary_artist.name.toLowerCase() != "spotify") // Remove Spotify's "playlists tracks" results
            {
                relevantHit = hits[i];
                break;
            }
        }
        return relevantHit != null ? relevantHit.result : hits[0].result;
    }
}