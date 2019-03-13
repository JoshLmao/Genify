class logger {
    static log( message ) {
        console.log(logger.getDateString() + " | " + message);
    }

    static error( message ) {
        console.error(logger.getDateString() + " | " + message);
    }

    static getDateString() {
        var m = new Date();
        var dateString =
            m.getUTCFullYear() + 
            "/" + 
            ("0" + (m.getUTCMonth()+1)).slice(-2) + 
            "/" + 
            ("0" + m.getUTCDate()).slice(-2) + 
            " " + 
            ("0" + m.getUTCHours()).slice(-2) +
            ":" +
            ("0" + m.getUTCMinutes()).slice(-2) + 
            ":" +
            ("0" + m.getUTCSeconds()).slice(-2);
        return dateString;
    }
}