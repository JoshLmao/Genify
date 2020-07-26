import React from 'react';
import { 
    faQuestion,
    faTv, 
    faLaptop,
    faMobile,
    faTablet,
    faGamepad,
    faCar,
    faVolumeUp,
} from '@fortawesome/free-solid-svg-icons';

// Gets a HTML formatted string of all artists on one track, separated with a comma and correct hyperlinking
// For example "Enter Shikari, TWICE, KSI"
export function getFormattedArtists (playState) {
    if (!playState) {
        return null;
    }

    let allArtists = playState.item?.artists;
    if (allArtists) {
        return (
            <div className="d-flex">
                {
                    allArtists.map((value, index) => {
                        return (
                        <div className="d-flex" key={value.name}>
                            <a  href={value.external_urls.spotify}>{value.name}</a> 
                            { index < allArtists.length - 1 && <div className="pr-1"> ,</div> }
                        </div>
                        )
                    })
                }
            </div>
        );
    }
    return null;
}

/// Gets a formatted string of all the artists separated with a comma
/// For example, "pewdiepie, Party in Backyard, KSI"
export function getArtistsToDisplay (playState) {
    if(!playState) {
        return null;
    }
    let allArtists = playState.item?.artists;
    if (allArtists) {
        let str = allArtists.map((value) => {
            return value.name;
        }).join(', ');
        return str;
    }
}

/// Encodes the data into application/x-www-form-urlencoded for POST requests
/// https://stackoverflow.com/a/37562814/11593118
export function urlEncodeData(data) {
    var formBody = [];
    for (var property in data) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(data[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    return formBody;
}

/// Checks if the current auth is invalid, null or expired
export function hasAuthExpired(auth) {
    return auth === null || (auth != null && auth.expireDate < Date.now());
}

/// Returns a font awesome icon related to the type of playback device
export function deviceTypeToIcon (deviceType) {
    switch(deviceType.toLowerCase()) {
        case "tv":
            return faTv;
        case "computer":
            return faLaptop;
        case "smartphone":
            return faMobile;
        case "tablet":
            return faTablet;
        case "gameconsole":
            return faGamepad;
        case "speaker":
            // faSpeaker isn't part of font awesome free ;( so use volume up instead
            return faVolumeUp;
        case "automobile":
            // Yo, if you are actually casting to Spotify in a car, then you livin' in 2077
            return faCar;
        default:
            return faQuestion;
    }
}