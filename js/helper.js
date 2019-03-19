class helper {
    // Decide if current environment is development or not
    static isDevMode() {
        return location.protocol == "file:";
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
}