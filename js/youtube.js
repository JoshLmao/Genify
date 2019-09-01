var yt_player = 0;
var isPlayerReady = false;
function onYouTubeIframeAPIReady() {
    var shouldBeWhite = cookies.getCookie(COOKIE_CONST.player_color) == "true";
    yt_player = new YT.Player('youtubePlayer', {
        events: {
          'onReady': youtube.onPlayerReady,
          'onError': youtube.onError,
          'onStateChange': youtube.onPlayerStateChanged
        },
        videoId: '', // No default video
        playerVars: {
            enablejsapi: 1,
            modestbranding: 1,
            disablekb: 1,
            color: shouldBeWhite ? "white" : "red",
            widget_referrer: "genify.joshlmao.com",
        }
    });
}

class youtube {
    static onPlayerReady(event) {
        isPlayerReady = true;
        event.target.setVolume(0);

        if(youtube.queued_video_id) {
            youtube.loadVideoId(youtube.queued_video_id);
            youtube.queued_video_id = "";
        }
    }

    static onPlayerStateChanged (event) {
        youtube.player_state = event.target.getPlayerState();
    }

    static onError (event) {
    }

    static getPlayer () {
        return yt_player;
    }

    static loadVideoId(id) {
        if (yt_player && isPlayerReady) {
            yt_player.loadVideoById(id);
            logger.log(`Setting YT Player Id (${id})`);
        } else if(!isPlayerReady) {
            // Set video to be loaded once player is ready
            youtube.queued_video_id = id;
        }
    }

    static setPlayback (ms) {
        if (yt_player) {
            var secs = ms / 1000;
            var playerSecs = yt_player.getCurrentTime();
            if ( !helper.isInRange(playerSecs, secs, 2) ) {
                yt_player.seekTo(secs);
            }
        }
    }

    static setPlaying (isPlaying) {
        if (yt_player) {
            if (isPlaying) {
                yt_player.playVideo();
            } else {
                yt_player.pauseVideo();
            }
        }
    }

    static findVideo (trackName, artistName, successCallback) {
        var searchTerm = trackName + "+" + artistName;
        var apiKey = "AIzaSyCsuEpIj8bIWkOhGJnUzaO7V5O_hHUI6_M";
        var baseUrl = "https://www.googleapis.com/youtube/v3";
        var path = `/search?part=snippet&order=relevance&q=${searchTerm}&type=video&videoEmbeddable=true&key=${apiKey}`
        var url = `${baseUrl}${path}`
        $.ajax({
            url: url,
            success: function (data) {
                if ( data ) {
                    var video = youtube.getRelevantSearch( data.items, trackName, artistName );
                    if (video) {
                        successCallback(video.id.videoId);
                    }
                }
            },
            error: function(response) {
                logger.error("Youtube Find - " + response.responseJSON.error.message);
            },
        });
    }

    // Finds a relevant video from the search results, gives first if none found
    static getRelevantSearch (searchResults, trackName, artistName) {
        var i = 0;
        for (i = 0; i < searchResults.length; i++) {
            var videoTitle = searchResults[i].snippet.title.toLowerCase();
            // Filter unwanted related videos by phrase (Lyric videos, covers)
            if ( videoTitle.includes("lyrics") ||  videoTitle.includes("cover"))
                continue;

            var channelName =  searchResults[i].snippet.channelTitle.toLowerCase();
            var cleanArtistName = artistName.replace(/ /g, '').toLowerCase();
            if ( channelName.includes("vevo") || channelName.includes(cleanArtistName))
                break;
            if (videoTitle.toLowerCase().includes("official video"))
                break;
        }

        // If found no relevant video, return the first
        if ( i == searchResults.length) {
            i = 0;
        }
        
        return searchResults[i];
    }

    static isPlayerEnabled () {
        return cookies.getCookie(COOKIE_CONST.youtube_video) == "true";
    }
}