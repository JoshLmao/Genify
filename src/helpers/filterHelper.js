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

// Removes any spaces in the string
export function filterAnySpace (str) {
    return str.replace(/\s/g, '');
}

/// Replaces &amp; from HTML to a normal ampersand
export function replaceHTMLAmpersand(str) {
    return str.replace(/&amp;/g, "&");
}

/// Boils a string and removes elements to create a string to use for comparison.
export function boilString (str) {
    // Replace any weird space chars 
    str = filterSpecialSpace(str);
    // Remove any special chars
    str = filterSpecialChars(str);
    // remove any white spaces
    str = filterAnySpace(str);
    // Return lower case'd version
    return str.toLowerCase();
}