// Parse the lyrics from the Genius URL
const setLyrics = function (lyricsText) {
    $("#geniusLoading").hide();
    
    var rawLyrics = lyricsText.trim();
    lyricsService.initLyrics(rawLyrics);

    $("#tradSimpBtn").text(lyricsService.isSimplified ? "To Traditional" : "To Simplified");
    $("#tradSimpBtn").toggle(lyricsService.language == "chinese");
    
    $("#hiraKataBtn").toggle(lyricsService.language == "japanese");
    $("#hiraKataBtn").text(lyricsService.isHiragana ? "To Hiragana" : "To Katakana");

    $("#romanizeBtn").toggle(this.language != "english");
    

    // Reset romanized
    isRomanized = cookies.getCookie(COOKIE_CONST.auto_romanize);
    var lyrics = lyricsService.getLyrics(isRomanized);
    $("#geniusLyricsContent").text(lyrics);
}

/* Variables */ 
var auto_auth_thread = null;

$(() => {
    // Set the site version number for help
    $("#versionNumber").text("v2.0.0");

    // If the current lyrics are romanized or not
    let isRomanized = false;
    let isSimplified = null;
    let isHiragana = null;

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
        spotify.getUserAuth();
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
        if( isSimplified != null ) {
            $("#tradSimpBtn").toggle(!isRomanized);
        }
        if ( isHiragana != null ) {
            $("#hiraKataBtn").toggle(!isRomanized);
        }
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

    $("#hiraKataBtn").click(() => {
        // Hiragana or Katakana
        if ( isHiragana == null ) {
            isHiragana = !lyricsService.isHiragana;
        } else {
            isHiragana = !isHiragana;
        }
        
        $("#hiraKataBtn").text( isHiragana ? "To Hiragana" : "To Katakana");
        lyricsService.convertJapanese(isHiragana, function (lyrics) {
            $("#geniusLyricsContent").text(lyrics);
        })
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
        $("#hiraKataBtn").hide();

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
            loadYoutubeVideo(trackData.trackName, trackData.artistName, function(url) {
                logger.log(`Updated Youtube video to url '${url}'`);
            });
        }
    };

    // Listener for Spotify State changes
    spotify.onStateChanged = function (isPlayingState) {
        youtube.setPlaying(isPlayingState);
    }

    spotify.onDeviceAmountChanged = function (devices) {
        var activeDevice = null;
        findFirstActive = function (device) {
            return device.is_active;
        };
        activeDevice = devices.find ( findFirstActive );
        setDevices(devices, activeDevice.id)
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
            $("#hiraKataBtn").hide();

            logger.log(`Expires at '${auth.expireDate}'`);
            var date = auth.expireDate.toISOString().substring(0, 10);
            var time = auth.expireDate.toISOString().substring(11, 19);
            $("#authExpire").text(date + " " + time);

            var differenceMs = auth.expireDate - Date.now();
            setTimeout(function() {
                helper.showWarningUI("Spotify authorization is about to expire (One minute)");
                window.clearTimeout( this.displayExpireThread );
            }, differenceMs - 1 * 60 * 1000);

            if (cookies.getCookie( COOKIE_CONST.auto_authentificate) == "true" 
                && auto_auth_thread == null ) {
                auto_auth_thread = setTimeout( function () {
                    spotify.getUserAuth();
                }, differenceMs);
                console.log("Expires in '" + differenceMs + "' ms");
            }

            // Start update loop, sets UI
            spotify.startUpdateLoop(setSpotifyUI);
            
            spotify.getAccountInfo(function (data) {
                $("#accountId").text(data.id);
                $("#accountIdLink").attr("href", data.external_urls.spotify);
                $("#displayName").text(data.display_name);
                $("#accountType").text(data.product.toLowerCase() == "premium" ? "Premium" : "Free");
            });
            spotify.getPlaybackDevices (function (data) {
                if ( data.devices.length <= 0) 
                    return;
                refreshDevicesPopout();
            });
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
    const loadYoutubeVideo = function (trackName, artistName, successCallback) {
        $("#youtubeLoading").show();
        $(".youtubeContainer").hide();
        youtube.findVideo(trackName, artistName, function (url) {
            youtube.loadVideoId(url);
            $("#youtubeLoading").hide();
            $(".youtubeContainer").show();
            if (successCallback)
                successCallback(url);
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
        // Spotify web playback sdk enabled
        var spotifyWebPlayback = cookies.getCookie(COOKIE_CONST.web_playback) == "true";
        $("#webPlaybackSwitch").prop('checked', spotifyWebPlayback);
        $("#webPlaybackSwitch").change( function () {
            var isChecked = $(this).is(':checked');
            cookies.setCookie(COOKIE_CONST.web_playback, isChecked);

            $(".spotify-web-playback").toggle(isChecked);

            $("#webPlaybackSwitchUI").hide();
            $("#webPlaybackLoading").show();
            spotify.setWebPlayback(isChecked, function () {
                $("#webPlaybackSwitchUI").show();
                $("#webPlaybackLoading").hide();
            });
        });
        $("#webPlaybackDeviceName").text(`(Device Name: '${spotify.DEVICE_NAME}')`);

        var autoAuth = cookies.getCookie( COOKIE_CONST.auto_authentificate) == "true";
        $("#autoAuthSwitch").prop('checked', autoAuth);
        $("#autoAuthSwitch").change( function () {
            var isChecked = $(this).is(':checked');
            cookies.setCookie(COOKIE_CONST.auto_authentificate, isChecked);

            if ( auto_auth_thread == null ) {
                var diffMs = spotify.currentAuthToken.expireDate - Date.now();
                auto_auth_thread = setTimeout (function () {
                    spotify.getUserAuth();
                }, diffMs);
                console.log("Expires in '" + diffMs + "' ms");
            } else {
                clearTimeout( auto_auth_thread );
                auto_auth_thread = null;
            }
        });
    }

    // Init function for setting start values and initialization
    const initPage = () => {
        isRomanized = false;
        $("#romanizeBtn").text("Romanize");

        // Add onclick to whitelist on 'a' elements
        var myDefaultWhiteList = $.fn.tooltip.Constructor.Default.whiteList
        myDefaultWhiteList.a.push('onclick');
        myDefaultWhiteList.a.push('style');
        myDefaultWhiteList.i.push('style');
    }

    // Bootstrap - Enable popovers and tooltips
    $(function () { $('[data-toggle="tooltip"]').tooltip() });
    
    // Devices popover
    $("[data-toggle=popover]").popover({
        html: true,
        template: `<div class="devices-menu popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>`,
        content: function() {
            return $('#devicesPopover').html(); 
        },
        title: 'Devices',
    }).click(function() {
        $(this).popover('show');
    });
    // Click anywhere, defocus from Popover
    $('body').on('click', function (e) {
        $('[data-toggle="popover"]').each(function () {
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            $(this).popover('hide');
        }
        });
    });

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
        if ( cookies.getCookie( COOKIE_CONST.youtube_video ) == "true") {
            $(".youtube-player-ui").fadeIn();
        }
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

var canChangeDevice = true;
function onChangeDevice (deviceId, deviceUIRef) {
    if (canChangeDevice) {
        canChangeDevice = false;
        $(deviceUIRef).append(`<div class="align-middle ml-2 loading-icon"><i class="fa fa-spinner fa-pulse fa-lg fa-fw"></i></div>`);
        spotify.setPlaybackDevice(deviceId, function () {
            refreshDevicesPopout(deviceId);

            canChangeDevice = true;
            $(deviceUIRef).children("div.loading-icon").remove();
            $('[data-toggle=popover]').popover('hide');
        });
    }
}

const getIcon = function (iconName) {
    switch (iconName.toLowerCase()) {
        case "tv":
            return `fas fa-tv`;
        case "computer":
            return `fas fa-desktop`;
        case "smartphone":
            return `fas fa-mobile-alt`;
    }
}

const refreshDevicesPopout = function (activeDeviceId = undefined) {
    //Set popover UI
    spotify.getPlaybackDevices(function (data) {
        if(!data.devices)
            return;

        setDevices(data.devices, activeDeviceId);
    });
}

const setDevices = function (devices, activeDeviceId) {
    var activeDevice = null;
    if ( activeDeviceId === undefined ) {
        // Move active device to first element
        findFirstActive = function (device) {
            return device.is_active;
        };
        activeDevice = devices.find( findFirstActive );
    } else {
        findFirstActive = function (device) {
            return device.id == activeDeviceId;
        };
        activeDevice = devices.find ( findFirstActive );
    }
    var index = devices.findIndex( function (element) { 
        return activeDevice != null ? element.id == activeDevice.id : element; 
    });
    devices.splice(index, 1);
    devices.splice(0, 0, activeDevice);

    var content = "";
    if( devices.length == 0 ) {
        content = "<div class='text-center text-white'>No devices available</div>"
    }
    for(var i = 0; i < devices.length; i++) {
        var device = devices[i];
        if (device == undefined ) 
            continue;
            
        var iconHtml = `<i class="${getIcon(device.type)} align-self-center" style="width:25px"></i>` ;
        var isActive = activeDevice.id == device.id ? " active-device" : "";
        content += `<a onclick="onChangeDevice('${device.id}', this);" href="#" 
                        class="list-group-item d-flex${isActive}">
                        ${iconHtml}<h6 class="ml-2 my-auto">${device.name}</h6>
                    </a>`;
    }
    content += "<a href='https://www.spotify.com/us/connect/' target='_blank' class='my-2 mx-auto px-3 py-1 btn btn-warning btn-sm text-white' style='border-radius:16px; '>LEARN MORE</a>"
    
    $('[data-toggle=popover]').popover('hide');    
    $('#devicesPopoverContent').html(content);
    if ( !$("#devicesBtn").is(":visible"))
        $("#devicesBtn").show();
}