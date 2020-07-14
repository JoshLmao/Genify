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