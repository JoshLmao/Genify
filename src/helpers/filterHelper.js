/// Removes any brackets from inside a string
export function filterBrackets(str) {
    return str.replace(/ *\([^)]*\) */g, "");
}

/// Removes any new line or spaces at start and end string
export function filterStartEndSpaceChars(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

/// Removes any special characters
export function filterSpecialChars(str) {
    return str.replace(/[^\w\s]/gi, '');
}

// Replaces any special space characters with a "normal" space
export function filterSpecialSpace(str) {
    return str.replace(/\s/g, ' ');
}

/// Strips a string of common irrelevant chars and returns a lower case version
export function processString (str) {
    // Replace any weird space chars 
    str = filterSpecialSpace(str);
    // Remove any special chars
    str = filterSpecialChars(str);

    // Return lower case'd version
    return str.toLowerCase();
}