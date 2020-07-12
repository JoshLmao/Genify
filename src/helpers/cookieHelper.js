class Cookies {
    static setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;";
    }

    static getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }

    // deletes a specific cookie by it's name
    static deleteCookie(name) {
        var cookies = document.cookie;
        var ca = cookies.split(';');
        var index = -1;
        for( var i = 0; i < ca.length; i++ ) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                index = i;
            }
        }

        ca.splice(index, 1);
        document.cookie = ca.join(';');
    }
  
    static checkCookie(cname) {
        var hasCookie = Cookies.getCookie(cname);
        return hasCookie !== "";
    }
}

export default Cookies;

// Cookie names used to store cookies
export const EGenifyCookieNames = {
    // Stores JSON stringified of last auth
    SPOTIFY_AUTH: "spotify-auth",
};