/// Removes any brackets from inside a string
export function filterBrackets(str) {
    return str.replace(/ *\([^)]*\) */g, "");
}