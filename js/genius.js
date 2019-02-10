var genius = function(){}

genius.getSearchFirstResult = function (trackName, artistName, callback) {
    var proxyUrl = "https://cors-anywhere.herokuapp.com/";
    var url = proxyUrl + "https://api.genius.com/search?q=" + encodeURIComponent(artistName) + "%20" + encodeURI(trackName);
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
                    return;
                }
                var firstHit = response.response.hits[0];
                debugger;
                var url = firstHit.result.url;
                callback(url);
            }
        },
        error: function(response) {
            console.error("Unable to get lyrics from Genius - " + response);
        },
    });
}
