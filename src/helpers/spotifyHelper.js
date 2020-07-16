import React from 'react';

// Gets a formatted string of all artists on one track, separated with a comma and correct hyperlinking
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