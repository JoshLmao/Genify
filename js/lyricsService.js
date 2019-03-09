class lyricsService {
    static init() {
        this.currentLyrics = "english";
        this.language = "english";
        this.translatedLyrics = "";
    }

    // Initializes the latest lyrics and romanizes it
    static initLyrics (lyrics) {
        this.currentLyrics = lyrics;

        lyricsService.detectLanguage(lyrics);

        if(this.language == "korean") {
            // Korean
            this.translatedLyrics = lyricsService.toRomaja(lyrics);
        } else if (this.language == "japanese") {
            // Japanese
            this.translatedLyrics = lyricsService.toRomanji(lyrics);
        } else if (this.language == "chinese") {
            // Chinese
            this.translatedLyrics = lyricsService.toPinyin(lyrics);
        }
        if (this.language != "english") {
            $("#romanizeBtn").show();
        } else {
            $("#romanizeBtn").hide();
        }
    }

    // Gets the current lyrics for the current song
    static getLyrics (isRomanized) {
        if ( isRomanized ) {
            return this.translatedLyrics;
        } else {
            return this.currentLyrics;
        }
    }

    // Detects for certain language using Regex and sets it
    static detectLanguage (lyrics) {
        // Expression for detecting any Korean characters
        var koreanChars = lyrics.match(/[\u3131-\uD79D]/ugi);
        if( koreanChars != null ) { 
            this.language = "korean";
        }

        // Detect both Chinese & Japanese
        var japaneseChars = lyrics.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/);
        var chineseChars = lyrics.match(/[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/);
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
}