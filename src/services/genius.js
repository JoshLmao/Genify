import axios from "axios";
import {
    GENIUS_ACCESS_TOKEN,
    REQUEST_TIMEOUT_MS,
    PROXY_URL
} from "../consts";

const GeniusService = {

    getRelevantResult: function (playData, callback) {
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
        var url = PROXY_URL + url;
        // $.get(url, function( html ) {
        //     var lyrics = $(html).find("div").filter(".lyrics").text();
        //     callback(lyrics);
        // });
        axios({
            method: 'GET',
            url: PROXY_URL + geniusUrl,
            headers: { 'Authorization': 'Bearer ' + GENIUS_ACCESS_TOKEN },
            timeout: REQUEST_TIMEOUT_MS,
        }).then(result => {
            //console.log(result);
            if(callback) {
                //console.log(result.request.responseText);

                var parseHTML = function(str) {
                    var tmp = document.implementation.createHTMLDocument();
                    tmp.body.innerHTML = str;
                    return tmp.body;
                };
                  
                let html = parseHTML(result.request.responseText);
                let filtered = html.querySelectorAll(".lyrics");

                callback(filtered[0].textContent);
            }
        }).catch(error => {
            console.error(error);
        });
    },
}

export default GeniusService;