$(() => {
    const getSpotify = () => {
        spotify.redirectUser();
    } 

    $("#btnSignIn").click(() => {
        console.log("Sign into Spotify");
        getSpotify();
    });

    const readHash = () => {
        if (location.hash && location.hash !== "#") 
        {
            const raw_data = location.hash.substring(1); 
            debugger;            
            var split = raw_data.split("&");
            var token = split[0].substring(13);
            var tokenType = split[1].substring(11);
            var expiresSeconds = split[2].substring(10);

            const data = raw_data.split(",");
            const decoded = decodeURI(data[0]);
        }
    }

    readHash();
});