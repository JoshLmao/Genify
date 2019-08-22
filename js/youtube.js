var player = 0;
var isPlayerReady = false;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubePlayer', {
        events: {
          'onReady': youtube.onPlayerReady,
          'onError': youtube.onError,
          'onStateChange': youtube.onPlayerStateChanged
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

    static loadVideoId(id) {
        if (player && isPlayerReady) {
            player.loadVideoById(id);
        } else if(!isPlayerReady) {
            // Set video to be loaded once player is ready
            youtube.queued_video_id = id;
        }
    }

    static setPlayback (ms) {
        if (player) {
            var secs = ms / 1000;
            var playerSecs = player.getCurrentTime();
            if ( !helper.isInRange(playerSecs, secs, 2) ) {
                player.seekTo(secs);
            }
        }
    }

    static setPlaying (isPlaying) {
        if (player) {
            if (isPlaying) {
                player.playVideo();
            } else {
                player.pauseVideo();
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
                    var videoId = data.items[0].id.videoId;
                    successCallback(videoId);
                }
            },
            error: function(response) {
                console.log("Failed - " + response);
            },
        });
    }
}