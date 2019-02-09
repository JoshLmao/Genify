$(() => {
    const getSpotify = () => {
        spotify.redirectUser();
    } 

    $("#btnSignIn").click(() => {
        console.log("Sign into Spotify");
        getSpotify();
    });

    const showLyrics = function (obj) {
        var trackName = obj.item.name;
        var artistName = obj.item.artists[0].name;
        debugger;
    }

    const readHash = () => {
        if (location.hash && location.hash !== "#") 
        {
            const raw_data = location.hash.substring(1); 
            debugger;            
            var split = raw_data.split("&");
            var authToken = split[0].substring(13);
            var tokenType = split[1].substring(11);
            var expiresSeconds = split[2].substring(11);

            spotify.getCurrentPlayback(authToken, function (response){
                showLyrics(response);
            });
        }
    }

    readHash();
});