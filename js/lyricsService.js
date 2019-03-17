class lyricsService {
    static init() {
        this.currentLyrics = "english";
        this.language = "english";
        this.romanizedLyrics = "";
        this.isSimplified = false;
    }

    // Initializes the latest lyrics and romanizes it
    static initLyrics (lyrics) {
        this.currentLyrics = lyrics;

        lyricsService.detectLanguage(lyrics);
        $("#tradSimpBtn").text(this.isSimplified ? "To Traditional" : "To Simplified");

        if(this.language == "korean") {
            // Korean
            this.romanizedLyrics = lyricsService.toRomaja(lyrics);
        } else if (this.language == "japanese") {
            // Japanese
            this.romanizedLyrics = lyricsService.toRomanji(lyrics);
        } else if (this.language == "chinese") {
            // Chinese
            this.romanizedLyrics = lyricsService.toPinyin(lyrics);
        }

        $("#romanizeBtn").toggle(this.language != "english");
        $("#tradSimpBtn").toggle(this.language == "chinese");
    }

    // Gets the current lyrics for the current song
    static getLyrics (isRomanized) {
        if ( isRomanized ) {
            return this.romanizedLyrics;
        } else {
            return this.currentLyrics;
        }
    }

    // Converts the current lyrics between Traditional or Simplified
    static convertChinese (toSimplified) {
        // Using Hustlzp S2T
        // https://github.com/hustlzp/jquery-s2t
        if ( toSimplified ) {
            return $.t2s(this.currentLyrics);
        } else {
            return $.s2t(this.currentLyrics);
        }
    }

    // Detects for certain language using Regex and sets it
    static detectLanguage (lyrics) {
        // Expression for detecting any Korean characters
        var koreanChars = lyricsService.getKoreanChars(lyrics);
        if( koreanChars != null ) { 
            this.language = "korean";
        }

        // Detect both Chinese & Japanese
        var japaneseChars = lyricsService.getJapaneseChars(lyrics);
        var chineseChars = lyricsService.getChineseChars(lyrics);
        // Determine language by seeing which contains the most characters 
        if( japaneseChars != null && chineseChars != null ) { 
            if( japaneseChars.length > chineseChars.length ) {
                this.language = "japanese";
            } else {
                this.language = "chinese";
            }
        } else if ( japaneseChars != null ) {
            this.language = "japanese";
        } else if( chineseChars != null ) {
            this.language = "chinese";
        }
        // Detect if majority of chars are Simplified or Traditional
        if( this.language == "chinese" ) {
            // Using to detect
            // https://github.com/nickdrewe/traditional-or-simplified
            var result = detect(lyrics);
            this.isSimplified = result.detectedCharacters == 'simplified';
        }

        // No other languages, set to English
        if( koreanChars == null && japaneseChars == null && chineseChars == null ) {
            this.language = "english";
        }
    }
    
    // Korean characters to Roman letters
    static toRomaja (lyrics) {
        // Uses Aromanize-js to convert
        // https://github.com/fujaru/aromanize-js
        return Aromanize.romanize(lyrics);
    }

    // Japanese characters to Roman
    static toRomanji (lyrics) {
        // Using Romaji.js
        // https://github.com/markni/romaji.js
        return romaji.fromKana(lyrics);
    }

    // Chinese characters to roman letters
    static toPinyin (lyrics) {
        // Uses Pinyin4JS
        // https://github.com/superbiger/pinyin4js
        return PinyinHelper.convertToPinyinString(lyrics, ' ', PinyinFormat.WITH_TONE_MARK);
    }

    // Returns an array of all Chinese characters in string
    static getChineseChars(lyrics) {
        return lyrics.match(/[\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FCC\uF900-\uFAAD]/g);
    }

    // Returns an array of all Japanese characters in string
    static getJapaneseChars(lyrics) {
        // Matches Hirgana or Katakana (https://gist.github.com/oanhnn/9043867)
        return lyrics.match(/[ぁ-んァ-ン]/g);
    }

    // Returns an array of all Korean characters in string
    static getKoreanChars(lyrics) {
        return lyrics.match(/[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g);
    }
}