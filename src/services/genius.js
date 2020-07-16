import axios from "axios";
import {
    GENIUS_ACCESS_TOKEN,
    REQUEST_TIMEOUT_MS,
    PROXY_URL
} from "../consts";
import { 
    filterBrackets,
    filterStartEndSpaceChars 
} from "../helpers/filterHelper";

const GeniusService = {

    /// Searches the Genius API using the spotify play context
    search: function (playData, callback) {
        if (!playData) 
            return null;

        let filteredTitle = filterBrackets(playData.item.name);
        let searchTerm = encodeURIComponent(`${filteredTitle} ${playData.item.artists[0].name}`);
        let geniusUrl = PROXY_URL + "https://api.genius.com/search?q=" + searchTerm;
        axios({
            method: 'GET',
            url: geniusUrl,
            headers: { 'Authorization': 'Bearer ' + GENIUS_ACCESS_TOKEN },
            timeout: REQUEST_TIMEOUT_MS,
        }).then(result => {
            if(callback) {
                callback(result.data);
            }
        }).catch(error => {
            console.error(error);
        });
    },

    /// Parses HTML from a url and returns the page's lyrics
    parseLyricsFromUrl(geniusUrl, callback) {
        var url = PROXY_URL + geniusUrl + "?react=1";
        axios({
            method: 'GET',
            url: url,
            headers: { 'Authorization': 'Bearer ' + GENIUS_ACCESS_TOKEN },
            timeout: REQUEST_TIMEOUT_MS,
        }).then(result => {
            if(callback) {
                var parseHTML = function(str) {
                    var tmp = document.implementation.createHTMLDocument();
                    tmp.body.innerHTML = str;
                    return tmp.body;
                };
                  
                let allLyrics = "";

                let html = parseHTML(result.request.responseText);
                let isNewGeniusLayout = html.querySelectorAll(".lyrics").length <= 0;
                if (isNewGeniusLayout) {
                    // Using new Genius layout
                    let allDivs = html.getElementsByTagName("div");
                    for(let div of allDivs) {
                        let lowercase = div.className.toLowerCase();
                        if(lowercase.includes("lyric") && lowercase.includes("container")) {
                            //Get initial html content
                            let innerHtml = div.innerHTML;
                            // Remove line breaks used as line endings
                            let brGone = innerHtml.replace(/<br>/g, '\n');
                            // Replace <div>...</div> content used for ads
                            let aGone = brGone.replace(/<[^>]*>?/gm, '');
                            allLyrics  += aGone;
                        }
                    }
                    if (allLyrics) 
                    {
                        let filteredLyrics = filterStartEndSpaceChars(allLyrics);
                        callback(filteredLyrics);
                    } else {
                        console.error(`Unable to parse lyrics correctly from page ${url}`);
                    }
                } else {
                    //Old Genius layout, use old algorithm
                    let filtered = html.querySelectorAll(".lyrics");
                    if (filtered.length > 0) 
                    {
                        let filteredLyrics = filterStartEndSpaceChars(filtered[0].textContent);
                        callback(filteredLyrics);
                    }
                    else
                        console.error("Unable to parse lyrics from old Genius layout");
                }
            }
        }).catch(error => {
            console.error(error);
        });
    },

    /// Gets the most relevant result from a range of hits from the Genius API, 
    /// using the Spotify track 'item'
    getRelevantResult: function (hits, trackInfo) {
        if (!trackInfo) {
            return;
        }
        if (hits && hits.length > 0) {
            for(let hit of hits) {
                let geniusArtist = hit.result.primary_artist.name.toLowerCase();
                let geniusTrackName = filterBrackets(hit.result.title).toLowerCase();

                let spotifyTrackName = filterBrackets(trackInfo.name).toLowerCase();
                let spotifyFirstArtistName = trackInfo.artists[0].name.toLowerCase();
                // Check if Genius track name/artist includes Spotify track name/artist or vice versa
                if ((geniusArtist.includes(spotifyFirstArtistName) && geniusTrackName.includes(spotifyTrackName))
                    || (spotifyFirstArtistName.includes(geniusArtist) && spotifyTrackName.includes(geniusTrackName))) {
                        return hit;
                }
            }
        } else {
            return null;
        }
    }
    
}

export default GeniusService;