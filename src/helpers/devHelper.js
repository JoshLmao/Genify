/// Returns a bool if currently in dev or production
export function isDev() {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
}