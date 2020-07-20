/// Enum of all supported languages to romanize/unromanize
export const ELanguages = {
    NONE: "none",
    ENG: "english",
    SZH: "simplified-chinese",
    TZH: "traditional-chinese",
    KR: "korean",
    JP: "japanese",
    RU: "russian",
}

/// Determines the primary majority language from a string
export function determineLanguage(str) {
    let lang = ELanguages.NONE;

    // Expression for detecting any Korean characters
    var koreanChars = getKoreanChars(str);
    if( koreanChars !== null ) { 
        lang = ELanguages.KR;
    }
    
    // Detect both Chinese & Japanese
    var japaneseChars = getJapaneseChars(str);
    var chineseChars = getChineseChars(str);
    // Determine language by seeing which contains the most characters 
    if( japaneseChars !== null && chineseChars !== null ) { 
        if( japaneseChars.length > chineseChars.length ) {
            lang = ELanguages.JP;
        } else {
            lang = ELanguages.SZH;
        }
    } else if ( japaneseChars !== null ) {
        lang = ELanguages.JP;
    } else if( chineseChars !== null ) {
        lang = "chinese";
    }

    var russianChars = getRussianChars(str);
    if( russianChars !== null ) {
        lang = ELanguages.RU;
    }

    // Detect if majority of chars are Simplified or Traditional
    if( lang === "chinese" ) {
        // Using to detect
        // https://github.com/nickdrewe/traditional-or-simplified
        //var result = TradOrSimp.detect(str);
        // if (result.detectedCharacters === 'simplified') {
        //     lang = ELanguages.SZH;
        // } else {
        //     lang = ELanguages.TZH;
        // }
        lang = ELanguages.SZH;
    }
    
    // No other languages, set to English
    if( koreanChars == null && japaneseChars == null && chineseChars == null && russianChars == null ) {
        lang = ELanguages.ENG;
    }

    return lang;
}

// Returns an array of all Korean characters in string
export function getKoreanChars(str) {
    return str.match(/[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g);
}

// Matches Hirgana or Katakana (https://gist.github.com/oanhnn/9043867)
export function getJapaneseChars(str) {
    return str.match(/[ぁ-んァ-ン]/g);
}

// Returns an array of all Chinese characters in string
export function getChineseChars(str) {
    return str.match(/[\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD]/g);
}

export function getRussianChars(str) {
    return str.match(/^[аАбБвВгГдДеЕёЁжЖзЗиИйЙкКлЛмМнНоОпПрРсСтТуУфФхХцЦчЧшШщЩъЪыЫьЬэЭюЮяЯ]+$/);
}