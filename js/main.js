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
            console.log(raw_data);   
            
            debugger;
            const data = raw_data.split(",");
            const decoded = decodeURI(data[0]);
        }
    }

    readHash();
});