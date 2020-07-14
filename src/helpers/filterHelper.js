/// Removes any brackets from inside a string
export function filterBrackets(str) {
    return str.replace(/ *\([^)]*\) */g, "");
}

/// Removes any new line or spaces at start and end string
export function filterStartEndSpaceChars(str) {
    return str.replace(/^\s+|\s+$/g, '');
}