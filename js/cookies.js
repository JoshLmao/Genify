// https://www.w3schools.com/js/js_cookies.asp

class cookies {
    static setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        debugger;
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;";
    }

    static getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }

      static checkCookie(cname) {
        var hasCookie = cookies.getCookie(cname);
        return hasCookie != "";
    }
}