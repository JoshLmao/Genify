import Cookies from "js-cookie";
import { EGenifyCookieNames } from "../enums/cookies";

// Safely attempts to parse a json string into an object
export function tryParseJSON(jsonString) {
    let jsonObject = null;
    try 
    {
        jsonObject = JSON.parse(jsonString);
    } 
    catch(e)
    {
        console.error("Unable to parse auth cookie");
    }
    return jsonObject;
}

/// Gets the latest app settings object from cookies
export function getAppSettings() {
    let settingsJsonStr = Cookies.get(EGenifyCookieNames.APP_SETTINGS);
    if (settingsJsonStr) {
        let appSettings = tryParseJSON(settingsJsonStr);
        return appSettings;
    } else {
        return null;
    }
}