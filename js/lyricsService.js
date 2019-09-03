class lyricsService {
    static init() {
        this.currentLyrics = "english";
        this.language = "english";
        this.romanizedLyrics = "";
        this.isSimplified = false;
        this.isHiragana = false;

        this.kuroshiro = new Kuroshiro();
        this.kuroshiro.init(new KuromojiAnalyzer({ dictPath: "/./vendor/kuroshiro/dict/" }));
    }

    // Initializes the latest lyrics and romanizes it
    static initLyrics (lyrics) {
        return new Promise(function (resolve, reject) {
            lyricsService.currentLyrics = lyrics;
            lyricsService.detectLanguage(lyrics);

            if(lyricsService.language == "korean") {
                // Korean
                lyricsService.romanizedLyrics = lyricsService.toRomaja(lyrics);
                resolve();
            } else if (lyricsService.language == "japanese") {
                // Japanese
                lyricsService.toRomanji(lyrics, function (romanjiLyrics) {
                    lyricsService.romanizedLyrics = romanjiLyrics;
                    resolve();
                });
            } else if (lyricsService.language == "chinese") {
                // Chinese
                lyricsService.romanizedLyrics = lyricsService.toPinyin(lyrics);
                resolve();
            } else {
                // English, etc
                resolve();
            }
        });
    }

    // Gets the current lyrics for the current song
    static getLyrics (isRomanized) {
        if (  lyricsService.language != "english" ) {
            if ( isRomanized ) {
                return this.romanizedLyrics;
            }
        }
        return this.currentLyrics;
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

    static convertJapanese ( toHiragana, setLyricsCallback ) {
        var toMode = "katakana";
        if ( toHiragana )
            toMode = "hiragana"   
        this.kuroshiro.convert(this.currentLyrics, { 
            to: toMode,
            mode: "spaced",
        }).then(setLyricsCallback);
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
        } else if ( this.langauge == "japanese" ) {
            var hasHiragana = this.kuroshiro.hasHiragana(lyrics);
            this.isHiragana = hasHiragana;
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
    static toRomanji (lyrics, convertCallback) {
        // Using Kuroshiro
        this.kuroshiro.convert(lyrics, { 
            to: "romaji",
            mode: "spaced",
        }).then(convertCallback);
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