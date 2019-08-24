const COOKIE_CONST = {
    youtube_video: "youtubeVideo",
    auto_romanize: "autoRomanize",
    player_color: "playerColor",
    web_playback: "spotify_web_playback"
}

class helper {
    // Decide if current environment is development or not
    static isDevMode() {
        return location.protocol == "file:" || location.hostname == "localhost";
    }

    // Get the CORS proxy URL, use whitelisted site on live
    static getProxyUrl() {
        return helper.isDevMode() ? "https://cors-anywhere.herokuapp.com/" : "https://genify-proxy.herokuapp.com/";
    }

    // Show and log an error message
    static showErrorUI (message) {
        logger.error(message);
        var html = `<div class="container mt-2">
                        <div class="alert alert-primary alert-dismissable show fade text-center" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                            <strong>${message}</strong>
                        </div>
                    </div>`;
        $("#mainContent").before(html);
    }

    // Show and log a warning message
    static showWarningUI (message) {
        logger.warning(message);
        var html = `<div class="container mt-2">
                        <div class="alert alert-warning alert-dismissable show fade text-center" role="alert">
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                            <strong>${message}</strong>
                        </div>
                    </div>`;
        $("#mainContent").before(html);
    }

    // Formats total milliseconds to a displayable time format (like 00:00)
    static msToTime(millisec) {
        var seconds = (millisec / 1000).toFixed(0);
        var minutes = Math.floor(seconds / 60);
        var hours = "";
        if (minutes > 59) {
            hours = Math.floor(minutes / 60);
            hours = (hours >= 10) ? hours : "0" + hours;
            minutes = minutes - (hours * 60);
            minutes = (minutes >= 10) ? minutes : "0" + minutes;
        }

        seconds = Math.floor(seconds % 60);
        seconds = (seconds >= 10) ? seconds : "0" + seconds;
        if (hours != "") {
            return hours + ":" + minutes + ":" + seconds;
        }
        return minutes + ":" + seconds;
    }

    // Compares two numbers to see if the first number is in range of the amount of the second number
    static isInRange ( number, compareTo, amount ) {
        return number - compareTo > -amount || compareTo - number < amount;
    }
}