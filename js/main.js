// Parse the lyrics from the Genius URL
const setLyrics = function (lyricsText) {
    $("#geniusLoading").hide();
    
    var rawLyrics = lyricsText.trim();
    lyricsService.initLyrics(rawLyrics);

    // Reset romanized
    isRomanized = cookies.getCookie(COOKIE_CONST.auto_romanize);
    var lyrics = lyricsService.getLyrics(isRomanized);
    $("#geniusLyricsContent").text(lyrics);
}

$(() => {
    // Set the site version number for help
    $("#versionNumber").text();

    // If the current lyrics are romanized or not
    let isRomanized = false;
    let isSimplified = null;

    const getSpotify = () => {
        spotify.getUserAuth();
    } 

    $("#pauseBtn").click(() => {
        spotify.pause();
    });
    $("#playBtn").click(() => {
        spotify.play();
    });
    $("#previousBtn").click(() => {
        spotify.previousSong();
    });
    $("#nextBtn").click(() => {
        spotify.nextSong();
    });
    $("#muteBtn").click(() => {
        spotify.mute();
    });
    $("#unmuteBtn").click(() => {
        spotify.unmute();
    });

    // Handler for Signing into Spotify
    $("#btnSignIn").click(() => {
        logger.log("Signing into Spotify");
        getSpotify();
    });

    // Handler for signing out of Spotify
    $("#btnSignOut").click(() => {
        onSignOut();
    });

    // Handler for when clicking the Romanize btn
    $("#romanizeBtn").click(() => {
        isRomanized = !isRomanized;
        $("#romanizeBtn").text( isRomanized ? "Unromanize" : "Romanize");
        var lyrics = lyricsService.getLyrics(isRomanized);
        $("#geniusLyricsContent").text(lyrics);

        // Hide Tradition to Simplified btn is romanized
        if( isSimplified != null )
            $("#tradSimpBtn").toggle(!isRomanized);
    });

    $("#tradSimpBtn").click(() => {
        // Get simplified state from service first, then invert
        if (isSimplified == null) {
            isSimplified = !lyricsService.isSimplified;
        } else {
            isSimplified = !isSimplified;
        }
        
        $("#tradSimpBtn").text( isSimplified ? "To Traditional" : "To Simplified");
        var lyrics = lyricsService.convertChinese(isSimplified);
        $("#geniusLyricsContent").text(lyrics);
    });

    // Handler for showing changelog
    $("#versionNumber").click(() =>{
        var textHolder = $('.modal-body').find(".text-holder");
        if( helper.isDevMode()) {
            textHolder.html(`<h4>v0.2</h4><ul><li>Example</li></ul><hr/><h4>v0.1</h4><ul><li>Example 1</li></ul>`)
        } else {
            var proxyUrl = helper.getProxyUrl();
            // Location is loaded from repo asset. Add host url to the relative url
            var logLocation = `https://genify.joshlmao.com/` + `extra/changelog.txt`;
            // Placeholder text while awaiting changelog text
            textHolder.html(`<h4 class="text-center font-weight-bold">Loading Changelog...</h4>`)
            $.get(proxyUrl + logLocation, function( html ) {
                textHolder.html(html);
            });
        }
        
        // Set title and display modal
        $('.modal-title').text("Changelog");
        $("#changelogModal").modal();
    })

    // Sets CSS style for page, if to show Lyrics or not
    const setStyle = function (isSignedIn) {
        $(".signed-out-ui").toggle(!isSignedIn);
        $(".signed-in-ui").toggle(isSignedIn);

        if(!isSignedIn)
            $(".youtube-player-ui").hide();
    }

    // Set the Spotify current track info UI
    const setSpotifyUI = function (trackData) {
        // Set track name, artist name and album image
        $("#trackTitle").text(trackData.trackName);
        $("#artistTitle").text(trackData.artistName);
        $("#albumArtwork").attr("src", trackData.albumArtUrl);

        $("#trackCurrentPosition").text(helper.msToTime(trackData.progress_ms));
        $("#trackTotalDuration").text(helper.msToTime(trackData.duration_ms));
        var percentDuration = trackData.progress_ms / trackData.duration_ms * 100; 
        $("#trackProgress").css("width", percentDuration + "%");

        $("#volumeProgress").css("width", trackData.volume_percent + "%");
        $(".muted").toggle(trackData.volume_percent <= 0);
        $(".unmuted").toggle(trackData.volume_percent > 0);

        $(".is-playing").toggle(trackData.isPlaying);
        $(".is-paused").toggle(!trackData.isPlaying);

        // Links for viewing Spotify artist and track
        $("#songLink").attr("href", trackData.songUrl);
        $("#artistLink").attr("href", trackData.artistUrl);
        $("#albumLink").attr("href", trackData.albumUrl);

        // Reset simplified bool since song changed
        isSimplified = null;
    }

    // Starts search into Genius for lyrics, updates UI
    const doGeniusSearch = function (trackData) {
        // Reset loading spinner, lyrics text & other controls
        $("#geniusLoading").show();
        $("#romanizeBtn").hide();
        $("#tradSimpBtn").hide();

        $("#geniusLyricsContent").text(null);
        $("#geniusAddLyrics").hide();

        genius.getSearchFirstResult(trackData, function (url) {
            genius.getLyricsFromUrl(url, function (lyrics) {
                setLyrics(lyrics);
            });
        });
    }

    // Listener for Spotify song change
    spotify.onSongChanged = function (trackData) {
        setSpotifyUI(trackData);
        doGeniusSearch(trackData);

        if ( youtube.isPlayerEnabled() ) {
            youtube.findVideo(trackData.trackName, trackData.artistName, function (url) {
                youtube.loadVideoId(url);
                logger.log(`Updated Youtube video to url ${url}`);
            });
        }
    };

    // Listener for Spotify State changes
    spotify.onStateChanged = function (isPlayingState) {
        youtube.setPlaying(isPlayingState);
    }

    // Checks for a hash in the URL and begins Spotify auth if so
    const readHash = () => {
        var auth = null;
        if (location.hash && location.hash !== "#") 
        {
            // Get data after '#'
            const data = location.hash.substring(1);

            // Only remove Spotify auth from URL if not developing
            if (!helper.isDevMode()) {
                var baseUrl = window.location.href.split("#")[0];
                window.history.pushState('name', '', baseUrl);
            }

            auth = spotify.parseAuth(data);

            if( auth == false ) {
                // Auth was denied by user
                helper.showWarningUI("Denied authorization from Spotify. Unable to continue");
                auth = null;
            } else {
                logger.log(`Loaded Spotify authentification from url params`);
            }
        } else if ( cookies.checkCookie("authToken") == true ) {
            auth = spotify.loadAuth();
            if (Date.now() > auth.expireDate ) {
                // Show expired cookies message and remove old auth cookies
                helper.showErrorUI("Spotify authentification has expired! Please re-sign in in to continue");
                cookies.deleteAllCookies();
                auth = null;
            } else if ( auth != null ) {
                logger.log("Loaded auth from cookies");
            } else {
                logger.error("No authentification loaded from cookies");
            }
        }
        if( auth !== null ) {
            // Has valid auth, init Spotify and UI
            setStyle(true);

            $("#romanizeBtn").hide();
            $("#tradSimpBtn").hide();

            logger.log(`Expires at '${auth.expireDate}'`);
            var date = auth.expireDate.toISOString().substring(0, 10);
            var time = auth.expireDate.toISOString().substring(11, 19);
            $("#authExpire").text(date + " " + time);
            
            var differenceMs = auth.expireDate - Date.now() - 1 * 60 * 1000;
            setTimeout(function() {
                helper.showWarningUI("Spotify authorization is about to expire (One minute)");
                window.clearTimeout( this.displayExpireThread );
            }, differenceMs);

            spotify.getCurrentPlayback(function (data) {
                setSpotifyUI(data);
                doGeniusSearch(data);
                
                if (youtube.isPlayerEnabled())
                    loadYoutubeVideo(data.trackName, data.artistName)
                    
                spotify.startUpdateLoop(setSpotifyUI);
                setStyle(true);
            });
            spotify.getAccountInfo(function (data) {
                $("#accountId").text(data.id);
                $("#accountIdLink").attr("href", data.external_urls.spotify);
                $("#displayName").text(data.display_name);
                $("#accountType").text(data.product.toLowerCase() == "premium" ? "Premium" : "Free");
            })
        } else {
            // No auth, show landing page
            setStyle(false);
        }
    }

    // Handling of (un)expected Ajax errors
    $(document).ajaxError(function (e, xhr, settings) {
        if (settings.url.includes("spotify")) {
            if (xhr.status == 401) {
                helper.showErrorUI("Error 401 - Unable to authorize with Spotify");
            } else if (xhr.status == 429) {
                helper.showErrorUI("Error 429 - Too many requests to Spotify. Try again later");
            } else {
                helper.showErrorUI(`Unknown Error '${xhr.status}' - ${xhr.responseText}`);
            }
        }
        setStyle(true);
    });

    // Sets loading UI and searches and loads YT video
    const loadYoutubeVideo = function (trackName, artistName) {
        $("#youtubeLoading").show();
        $(".youtubeContainer").hide();
        youtube.findVideo(trackName, artistName, function (url) {
            youtube.loadVideoId(url);
            $("#youtubeLoading").hide();
            $(".youtubeContainer").show();
        });
    }

    const loadSettings = function () {
        // Auto romanize JP/KR/ZH lyrics
        var isAutoRomanize = cookies.getCookie(COOKIE_CONST.auto_romanize);
        $("#autoRomanizeSwitch").prop('checked', isAutoRomanize);
        $("#autoRomanizeSwitch").change( function () {
            var isChecked = $(this).is(':checked');
            cookies.setCookie(COOKIE_CONST.auto_romanize, isChecked);
        });
        // Enable/Display Youtube Embed player
        var displayYoutubeVideo = cookies.getCookie(COOKIE_CONST.youtube_video) == "true";
        $("#displayYoutubeSwitch").prop('checked', displayYoutubeVideo);
        $("#displayYoutubeSwitch").change( function () {
            var isChecked = $(this).is(':checked');
            cookies.setCookie(COOKIE_CONST.youtube_video, isChecked);
            $(".youtube-player-ui").toggle(isChecked);

            spotify.getCurrentPlayback(function (trackData) {
                // Update Youtube Video if track has changed
                if ( !player.getVideoData().title.includes(trackData.trackName) )
                    loadYoutubeVideo(trackData.trackName, trackData.artistName);
            })
        });
        $(".youtube-player-ui").toggle(displayYoutubeVideo);
        // Set Youtube Embed player color
        var playerColor = cookies.getCookie(COOKIE_CONST.player_color) == "true";
        $("#ytPlayerColorSwitch").prop('checked', playerColor);
        $("#ytPlayerColorSwitch").change( function () {
            var isChecked = $(this).is(':checked');
            cookies.setCookie(COOKIE_CONST.player_color, isChecked);
        });
    }

    // Init function for setting start values and initialization
    const initPage = () => {
        isRomanized = false;
        $("#romanizeBtn").text("Romanize");
    }

    setStyle(false);
    spotify.spotify();
    lyricsService.init();
    initPage();
    loadSettings();
    readHash();
});

function onToggleSettings() {
    var isSettingsVisible = $( "#settingsPage" ).is( ":visible" );
    var fadeDurationMs = 100;
    if ( isSettingsVisible ) {
        $("#settingsPage").fadeOut(fadeDurationMs, function() {
            $("#geniusContent").fadeIn();
            if ( cookies.getCookie( COOKIE_CONST.youtube_video ) == "true") {
                $(".youtube-player-ui").fadeIn();
            }
        });
    } else {
        $(".youtube-player-ui").fadeOut(fadeDurationMs);
        $("#geniusContent").fadeOut(fadeDurationMs, function() {
            $("#settingsPage").fadeIn();
        });
    }
}

function onHideSettings() {
    var fadeDurationMs = 100;
    $("#settingsPage").fadeOut(fadeDurationMs, function () {
        $("#geniusContent").fadeIn();
        $(".youtube-player-ui").fadeIn();
    });
}

function onSignOut() {
    logger.log("Signing out of Spotify");
    cookies.deleteAllCookies();
    window.location.href = "https://genify.joshlmao.com";
}

function onNextLyricsBtn() {
    $("#geniusLyricsContent").text(null);
    
    var index = genius.searchInfo.hitIndex;
    index = index >= 10 ? 0 : index + 1;
    genius.getSearchResult(index, function (lyrics) {
        setLyrics(lyrics);
    });
}
function onPrevLyrics() {
    $("#geniusLyricsContent").text(null);
    
    var index = genius.searchInfo.hitIndex;
    index = index <= 0 ? 10 : index - 1;
    genius.getSearchResult(index, function (lyrics) {
        setLyrics(lyrics);
    });
}
