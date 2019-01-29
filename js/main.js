$(() => {
    const getSpotify = () => {
        spotify.getCredentials();
    } 

    $("#btnSignIn").click(() => {
        console.log("Sign into Spotify");
        getSpotify();
    });
});