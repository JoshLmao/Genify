class genius {

    static setNoLyricsUI() { 
        $("#geniusLoading").hide();
        $("#romanizeBtn").hide();
        $("#geniusAddLyrics").show();
        $("#geniusLyricsContent").text("Unable to find lyrics");
    }

    static search (searchTerm, successCallback, failedCallback) {
        var proxyUrl = helper.getProxyUrl();
        var url = proxyUrl + "https://api.genius.com/search?q=" + encodeURIComponent(searchTerm);
        var accessToken = CONST_APP.genius_access_token;
        $.ajax({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: successCallback,
            error: function(response) {
                failedCallback(response);
            },
        });
    }

    // Searches Genius for the artist and track name and returns the first result
    static getSearchFirstResult(trackData, callback) {
        var proxyUrl = helper.getProxyUrl();
        var trackNameClean = genius.cleanName(trackData.trackName);
        var searchParams = encodeURIComponent(`${trackData.artistName} ${trackNameClean}`);
        var url = proxyUrl + "https://api.genius.com/search?q=" + searchParams;
        var accessToken = CONST_APP.genius_access_token;
        $.ajax({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function (response) {
                genius.onGotResults(response, trackData, callback);
            },
            error: function(response) {
                logger.error("Unable to get lyrics from Genius - " + response);
                genius.setNoLyricsUI();
            },
        });
    }

    static onGotResults (response, trackData, callback) {
        if ( response != null) {
            if ( response.response.hits.length === 0) { 
                logger.error("Unable to find any Genius lyrics results");
                genius.setNoLyricsUI();
                return;
            }
            var hitResult = genius.getRelevantHit(response.response.hits, trackData);
            logger.log(`Loading lyrics '${hitResult.full_title}'`);
            callback(hitResult.url);
        }
    }

    // Gets the lyrics from the Genius URL page
    static getLyricsFromUrl(url, callback) {
        var proxyUrl = helper.getProxyUrl();
        var url = proxyUrl + url;
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
        var hitIndex = 0;
        for (var i = 0; i < hits.length; i++ ) {
            hitIndex = i;
            var hit = hits[i];

            // Remove any brackets, usually used to show featured artists
            var trackNameNoBracs = trackData.trackName.replace(/ *\([^)]*\) */g, "");
            if (hit.result.primary_artist.name.toLowerCase() != "spotify" && // Remove Spotify's "playlists tracks" results
                hit.result.title.includes(trackNameNoBracs) && // Title match
                hit.result.primary_artist.name.includes(trackData.artistName)) // Artist match
            {
                relevantHit = hits[i];
                break;
            }
        }
        // Fallback, use first result
        if (relevantHit == null ) {
            hitIndex = 0;
        }
        relevantHit = hits[hitIndex].result;

        if ( relevantHit != null ) {
            this.searchInfo = {
                lyricsUrl: relevantHit.url,
                hitIndex: hitIndex,
                track_name: trackData.trackName,
                artist_name: trackData.artistName,
                current_hit: hits[hitIndex].result,
            };
        } else {
            this.searchInfo = null;
        }

        return relevantHit;
    }

    static getSearchResult (index, lyricsCallback, failedCallback) {
        var artistName = this.searchInfo.artist_name;
        var trackName = this.searchInfo.track_name;
        genius.search(artistName + " - " + trackName, function (data) {
            var hits = data.response.hits;
            if (hits.length <= 0) {
                genius.getLyricsFromUrl(genius.searchInfo.lyricsUrl, lyricsCallback);
                return;
            }
            else if (hits.length <= index) {
                index = hits.length - 1;
            }

            genius.searchInfo = {
                lyricsUrl: hits[index].result.url,
                hitIndex: index,
                track_name: trackName,
                artist_name: artistName,
                current_hit: hits[index].result,
            }
            genius.getLyricsFromUrl(hits[index].result.url, function(lyrics) {
                logger.log(`Next lyrics '${hits[index].result.full_title}'`);
                lyricsCallback(lyrics);
            });
        }, null);
    }

    static nextLyrics (callback) {
        var lastIndex = this.searchInfo.hitIndex;
        var result = genius.getRelevantHit(lastIndex);
        callback(result);
    } 

    // Cleans the string to be search friendly
    static cleanName (name) {
        return name.replace(/ *\([^)]*\) */g, "");
    }
}