class helper {
    // Decide if current environment is development or not
    static isDevMode() {
        return location.protocol == "file:";
    }

    // Get the CORS proxy URL, use whitelisted site on live
    static getProxyUrl() {
        return helper.isDevMode() ? "https://cors-anywhere.herokuapp.com/" : "https://genify-proxy.herokuapp.com/";
    }
}