import axios from "axios";
import {
    GENIUS_ACCESS_TOKEN,
    REQUEST_TIMEOUT_MS,
    PROXY_URL
} from "../consts";

const GeniusService = {

    search: function (playData, callback) {
        if (!playData) 
            return null;

        let searchTerm = encodeURIComponent(`${playData.item.name} ${playData.item.artists[0].name}`);
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

    parseLyricsFromUrl(geniusUrl, callback) {
        var url = PROXY_URL + geniusUrl;
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
                  
                let html = parseHTML(result.request.responseText);
                let filtered = html.querySelectorAll(".lyrics");
                if (filtered.length > 0) {
                    callback(filtered[0].textContent);
                } else {
                    console.error(`Unable to parse lyrics from URL: ${geniusUrl}`);
                }
            }
        }).catch(error => {
            console.error(error);
        });
    },

    getRelevantResult: function (hits, trackInfo) {
        if (!trackInfo) {
            return;
        }
        if (hits && hits.length > 0) {
            for(let hit of hits) {
                let artist = hit.result.primary_artist.name;
                let song = hit.result.title;
                if (artist.toLowerCase().includes(trackInfo.artists[0].name.toLowerCase())
                    && song.toLowerCase().includes(trackInfo.name.toLowerCase())) {
                        return hit;
                }
            }
        } else {
            return null;
        }
    }
    
}

export default GeniusService;