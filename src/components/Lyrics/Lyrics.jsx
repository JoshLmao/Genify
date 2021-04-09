import React, { Component } from 'react';
import {
    Button, 
    Form,
    Col
} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import pinyin4js from 'pinyin4js';
import Aromanize from "aromanize";
import cyrillicToTranslit from "cyrillic-to-translit-js";

import { ELanguages } from "../../enums/languages";
import { 
    getAppSettings
} from '../../helpers/general';
import { 
    determineLanguage,
    isStringSimplifiedChinese,
} from "../../helpers/languageHelper";

import GeniusService from '../../services/genius';
import "./Lyrics.css";

class Lyrics extends Component {
    constructor(props) {
        super(props);

        const kuroshiro = new Kuroshiro();
        kuroshiro.init(new KuromojiAnalyzer({ 
            // Path starts at base of public folder
            dictPath: "./dict" 
        }));

        this.state = {
            // Current playState of Spotify
            playState: props.playState,
            auth: props.auth,

            originalLyrics: null,
            modifiedLyrics: null,

            // Current lyrics that are loaded, the spotify track info
            lyricsSpotifyTrackName: null,
            // Current lyrics info from Genius
            lyricsInfo: null,
            // Are the lyrics loaded
            loaded: true,
            /// Are the current modifiedLyrics romanized or not?
            isRomanized: false,
            /// Is the current modifiedLyrics all simplified or all traditional?
            isSimplified: false,
            /// Current determined language of the original lyric language
            originalLyricLanguage: ELanguages.NONE,
            // Kuroshiro object for using Kuroshiro functions
            kuroshiro: kuroshiro,
            // Should lyrics perform an update/search for (new) lyrics
            shouldUpdateLyrics: true,
            // Date object: Time taken to determine last lyrics
            lastSearchDuration: 0,
        };

        this.updateLyrics = this.updateLyrics.bind(this);
        this.onToggleRomanize = this.onToggleRomanize.bind(this);
        this.resetLyricState = this.resetLyricState.bind(this);
        this.onRetryLyricsBtn = this.onRetryLyricsBtn.bind(this);
        this.onToggleSimplification = this.onToggleSimplification.bind(this);
    }

    componentDidMount() {
        this.updateLyrics();
    }

    componentDidUpdate(prevProps) {
        if(prevProps.playState !== this.props.playState) {
            this.setState({
                playState: this.props.playState,
            },() => {
                // prevProps hasnt been set or song changed
                if (prevProps.playState === null || prevProps.playState?.item?.name !== this.props.playState?.item?.name) {
                    this.updateLyrics();
                }
            });
        }
        if(prevProps.auth !== this.props.auth) {
            this.setState({ auth: this.props.auth });
        }
    }

    updateLyrics() {
        // Only continue if we have a valid state and isn't loading other lyrics
        if(this.state.playState && this.state.loaded) {
            this.setState({ 
                loaded: false, 
                shouldUpdateLyrics: false,
                lyricsSpotifyTrackName: null,
            });

            let searchStartTime = Date.now();
            GeniusService.search(this.state.playState, (result) => {
                if(result.response.hits.length > 0) {
                    // Search hits for most relevant result
                    let info = GeniusService.getRelevantResult(result.response.hits, this.state.playState.item);
                    if (info) {
                        // Relevant Genius lyrics found
                        console.log(`Relevant Result: ${info.result.full_title}`);
                        GeniusService.parseLyricsFromUrl(info.result.url, (lyrics) => {
                            console.log(`Loaded and set lyrics from ${info.result.url}`);
                            let origLyricLang = determineLanguage(lyrics);
                            console.log(`Original lyrics language: '${origLyricLang}'`);

                            let totalTime = new Date(Date.now() - searchStartTime);
                            console.log(`Search took '${totalTime.getSeconds()}.${totalTime.getMilliseconds()}' seconds...`)
                            this.setState({
                                originalLyrics: lyrics,
                                modifiedLyrics: lyrics,
                                isRomanized: false,

                                originalLyricLanguage: origLyricLang,
                                isSimplified: origLyricLang === ELanguages.SZH,

                                lyricsInfo: info,
                                loaded: true,
                                lyricsSpotifyTrackName: this.state.playState.item,
                                lastSearchDuration: totalTime,
                            }, () => {
                                let appSettings = getAppSettings();
                                if (appSettings) {
                                    // Check if lyrics need to be auto-romanized
                                    if(appSettings.autoRomanize && this.state.originalLyricLanguage !== ELanguages.ENG) {
                                        this.onToggleRomanize();
                                    }
                                    // Check settings and convert if autoSimplify is enabled
                                    else if (appSettings.autoSimplifyChinese && !this.state.isSimplified) {
                                        this.onToggleSimplification();
                                    }
                                }
                            });
                        });
                    } else {
                        // No relevant Genius lyrics found
                        console.log(`No related lyrics found out of '${result.response.hits.length}' results for song '${this.state.playState.item.artists[0].name} - ${this.state.playState.item.name}'`);
                        this.setState({
                            loaded: true,
                        });
                        this.resetLyricState();
                    }
                } else {
                    // No search hits found at all
                    console.log("Didn't find any search results on Genius");
                    this.setState({
                        loaded: true,
                    });
                    this.resetLyricState();
                }
            });
        }
    }

    resetLyricState() {
        this.setState({
            originalLyrics: null,
            modifiedLyrics: null,
            lyricsInfo: null,
            isRomanized: false,
            originalLyricLanguage: ELanguages.NONE,
        });
    }

    onToggleRomanize() {
        // If no original lyrics, unable to romanize
        if (!this.state.originalLyrics) {
            return;
        }
        // If already romanized, display original
        if (this.state.isRomanized) {
            this.setState({
                modifiedLyrics: this.state.originalLyrics,
            });
        } else {
            // Else convert original to romanized version
            let romanizedLyrics = "";
            switch(this.state.originalLyricLanguage)
            {
                case ELanguages.JP:
                    {
                        // From Japanese
                        // Break if kuroshiro didn't init properly
                        if (!this.state.kuroshiro) { 
                            console.error("Unable to romanize Japanese - Error with Kuroshiro");
                            break; 
                        }
                        this.state.kuroshiro.convert(this.state.originalLyrics, { 
                            to: "romaji",
                            mode: "spaced",
                        }).then((romajiLyrics) => {
                            // remove double space added inbetween other phrases
                            romajiLyrics = romajiLyrics.replace(/ +(?= )/g,'');
                            this.setState({
                                modifiedLyrics: romajiLyrics,
                            });
                        });
                        break;
                    }
                    case ELanguages.SZH:
                    case ELanguages.TZH:
                        {
                            // Romanize from simplified or traditional chinese
                            romanizedLyrics = pinyin4js.convertToPinyinString(this.state.originalLyrics, ' ', pinyin4js.WITH_TONE_MARK)
                            break;
                        }
                    case ELanguages.KR:
                        {
                            // Romanize from Korean
                            romanizedLyrics = Aromanize.romanize(this.state.originalLyrics);
                            break;
                        }
                    case ELanguages.RU:
                        {
                            // Romanize from Russian crillic
                            romanizedLyrics = cyrillicToTranslit().transform(this.state.originalLyrics, " ");
                            break;
                        }
                default:
                    break;
            }
            // Set modified to romanized
            this.setState({
                modifiedLyrics: romanizedLyrics,
            });
        }

        this.setState({
            isRomanized: !this.state.isRomanized,
        });
    }

    // On Clicked - Retry Lyrics btn
    onRetryLyricsBtn() {
        if (!this.state.shouldUpdateLyrics) {
            this.setState({ shouldUpdateLyrics: true }, () => this.updateLyrics() );
            console.log("Retrying lyrics at request of user");
        }
    }

    /// On Toggle Chinese To Simplified toggle
    onToggleSimplification() {
        // If simplified, covert to trad, else to simplified
        let convertedLyrics = this.state.modifiedLyrics;
        if (this.state.isSimplified) {
            convertedLyrics = pinyin4js.convertToTraditionalChinese(convertedLyrics);
        } else {
            convertedLyrics = pinyin4js.convertToSimplifiedChinese(convertedLyrics);
        }

        // Set
        this.setState({
            modifiedLyrics: convertedLyrics,
            isSimplified: !this.state.isSimplified,
        });
    }
    
    render() {
        return (
            <div className="py-2 w-100 h-100">
                <div className="text-center h-100">
                    {
                        !this.state.loaded && 
                            <div className="text-center my-3">
                                <h6>Finding lyrics...</h6>
                                <FontAwesomeIcon className="fa-spin" size="3x" icon={faSpinner} />
                            </div>
                    }
                    {/* Lyrics container */}
                    {
                        this.state.modifiedLyrics && this.state.loaded &&
                        <div className="h-100">
                             <Col 
                                md={3} 
                                sm={3}
                                className="pr-4 pl-0 mb-2 text-right d-none d-sm-block"
                                style={{ 
                                    height: "35px", 
                                    position: "absolute", 
                                    right: 0,
                                    fontSize: "0.8rem",
                                    }}>
                                    <h6 className="mb-1">Lyric Info</h6>
                                    <a 
                                        href={this.state.lyricsInfo.result.url}
                                        className="py-1">
                                        {this.state.lyricsInfo.result.full_title}
                                    </a>
                                    {
                                        this.state.lastSearchDuration &&
                                            <div>Found in {this.state.lastSearchDuration.getSeconds()}.{this.state.lastSearchDuration.getMilliseconds()}s</div>
                                    }
                                    {
                                        // If original language is not english, display Romanize button
                                        this.state.originalLyricLanguage !== ELanguages.ENG && 
                                        <Form>
                                            <Form.Check
                                                type="switch"
                                                id="romanize-switch"
                                                label="Romanize"
                                                checked={this.state.isRomanized}
                                                onChange={this.onToggleRomanize}>
                                            </Form.Check>
                                        </Form>
                                    }
                                    {
                                        // If not romanized & original lyrics are Chinese, show switch to toggle between Traditional or Simplified
                                        !this.state.isRomanized && (this.state.originalLyricLanguage === ELanguages.SZH || this.state.originalLyricLanguage === ELanguages.TZH) &&
                                        <Form>
                                            <Form.Check
                                                type="switch"
                                                id="convert-simplified-switch"
                                                label="Convert To Simplified"
                                                checked={this.state.isSimplified}
                                                onChange={this.onToggleSimplification}>
                                            </Form.Check>
                                        </Form>


                                    }
                            </Col>
                            <div className="lyrics-content" style={{ 
                                fontSize: `${getAppSettings().lyricFontSize}rem`,
                            }} >
                                { this.state.modifiedLyrics }
                            </div>
                        </div>
                    }
                    {
                        // No song/lyrics UI
                        this.state.playState && !this.state.originalLyrics && this.state.loaded && 
                        <div className="d-flex flex-column">
                            <a href="https://genius.com/new">
                                <Button variant="outline-light" className="mt-2"> 
                                    Add to Genius
                                </Button>
                            </a>
                            <Button 
                                className="mx-auto my-2"
                                variant="outline-light" 
                                onClick={this.onRetryLyricsBtn}>
                                Retry Lyrics
                            </Button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Lyrics;