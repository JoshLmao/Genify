import axios from "axios";
import {
    GENIUS_ACCESS_TOKEN,
    REQUEST_TIMEOUT_MS,
    PROXY_URL
} from "../consts";
import { 
    filterBrackets,
    filterStartEndSpaceChars,
    boilString,
    replaceHTMLAmpersand
} from "../helpers/filterHelper";

// Removes any dash separators and keeps relevant info
// For example: "In The Air Tonight - 2015 Remastered"
function removeDashSeparators(songName) {
    let parts = songName.split(' - ');
    if (parts.length > 0) {
        let name = parts[0];
        return name;
    }
    // doesnt contain any '-' separators.
    return songName;
}

// Gets additional information about the song from the original song name
function buildAdditionalData(songName) {    
    songName = songName.toLowerCase();
    let isRemix = songName.includes("remix");
    let remixCreator;
    if (isRemix) {
        let includesLeftPa = songName.includes('(');
        let includesRightPa = songName.includes(')');
        let includesDash = songName.includes("-");
        if (includesLeftPa && includesRightPa && includesDash) {
            // Eg. "Same Soul (feat. Jaymes Young) - Marian Hill Remix"
        } 
        else if (includesLeftPa && includesRightPa) {
            // Eg. Grind Me Down (Jawster Remix)
            remixCreator = songName.match(/\(([^)]+)\)/)[1];
        } else if (includesDash) {
            // Eg. "Sssnakepit - Serial Killaz Remix"
            let parts = songName.split(' - ');
            let remixPartIndex = parts.findIndex(function(element) {
                return element.includes("remix");
            });
            if (remixPartIndex >= 0) {
                remixCreator = parts[remixPartIndex];
            }
        }
    }
    return {
        isRemix: isRemix,
        remixCreator: remixCreator,
    };
}

// From additional data, builds a relevant search query
function getFinalSearchName(songName, additionalData) {
    let nameSearchTerm = songName;
    if (additionalData.isRemix) {
        nameSearchTerm += " " + additionalData.remixCreator;
    }
    return nameSearchTerm;
}

const GeniusService = {

    /// Searches the Genius API using the spotify play context
    search: function (playData, callback) {
        if (!playData) 
            return null;

        // Get song name and strip information to only have base song name
        let songName = playData.item.name;
        // Get any info from song title
        let additionalData = buildAdditionalData(songName);
        // If includes dash separator(s)
        if (songName.includes('-')) {
            songName = removeDashSeparators(songName);
        }
        // if includes ( and ), filter it out
        if (songName.includes('(') && songName.includes(")")) {
            songName = filterBrackets(songName);
        }
        
        // Build search string of "[song name] [artist name]"
        let searchNameWithDetails = getFinalSearchName(songName, additionalData);
        let searchTerm = encodeURIComponent(`${searchNameWithDetails} ${playData.item.artists[0].name}`);
        // Build URL and request to Genius
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
        let url = PROXY_URL + geniusUrl + "?react=1";
        axios({
            method: 'GET',
            url: url,
            headers: { 'Authorization': 'Bearer ' + GENIUS_ACCESS_TOKEN },
            timeout: REQUEST_TIMEOUT_MS,
        }).then(result => {
            if(callback) {
                let parseHTML = function(str) {
                    let tmp = document.implementation.createHTMLDocument();
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
                            if(!aGone) {
                                // current div is a lyric container which contains an advert
                                aGone += '\n';
                            }
                            allLyrics  += aGone;
                        }
                    }
                    if (allLyrics) 
                    {
                        let filteredLyrics = filterStartEndSpaceChars(allLyrics);
                        filteredLyrics = replaceHTMLAmpersand(filteredLyrics);
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
                        filteredLyrics = filteredLyrics.replace('&amp;', '&');
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
                // genius artist - track
                let geniusArtist = boilString(hit.result.primary_artist.name);
                let geniusTrackName = boilString(hit.result.title);
                // spotify artist - track
                let spotifyTrackName = boilString(trackInfo.name);
                let spotifyFirstArtistName = boilString(trackInfo.artists[0].name);
                
                // Iterate through all Spotify artists to see if one of them matches the "primary_artist" of Genius
                let artistsMatch = false;
                if (trackInfo.artists.length > 1) {
                    for(let i = 0; i < trackInfo.artists.length; i++) {
                        let currentArtistName = boilString(trackInfo.artists[i].name);
                        if (geniusArtist.includes(currentArtistName)) {
                            artistsMatch = true;
                            break;  // Found match, stop looping
                        }
                    }
                }

                // Check if Genius track name/artist includes Spotify track name/artist or vice versa
                let geniusIncludes = geniusArtist.includes(spotifyFirstArtistName) && geniusTrackName.includes(spotifyTrackName);
                let spotifyIncludes = spotifyFirstArtistName.includes(geniusArtist) && spotifyTrackName.includes(geniusTrackName);
                
                if (geniusIncludes || spotifyIncludes || artistsMatch) {
                    return hit;
                }
            }
        } else {
            return null;
        }
    },
}

export default GeniusService;