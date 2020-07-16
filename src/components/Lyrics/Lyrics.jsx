import React, { Component } from 'react';
import {
    Button, 
    Form
} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
    determineLanguage,
    ELanguages
} from "../../helpers/languageHelper";

import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import pinyin4js from 'pinyin4js';
import Aromanize from "aromanize";
import cyrillicToTranslit from "cyrillic-to-translit-js";

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

            originalLyrics: null,
            romanizedLyrics: null,

            // Current lyrics that are loaded, the spotify track info
            lyricsSpotifyTrackName: null,
            // Current lyrics info from Genius
            lyricsInfo: null,
            // Are the lyrics loaded
            loaded: true,
            /// Are the current romanizedLyrics romanized or not?
            isRomanized: false,
            /// Current determined language of the original lyric language
            originalLyricLanguage: ELanguages.NONE,
            // Kuroshiro object for using Kuroshiro functions
            kuroshiro: kuroshiro,
            // Should lyrics perform an update/search for (new) lyrics
            shouldUpdateLyrics: true,
        };

        this.updateLyrics = this.updateLyrics.bind(this);
        this.onToggleRomanize = this.onToggleRomanize.bind(this);
        this.resetLyricState = this.resetLyricState.bind(this);
        this.onRetryLyricsBtn = this.onRetryLyricsBtn.bind(this);
    }

    componentDidUpdate(prevProps) {
        if(prevProps.playState !== this.props.playState) {
            this.setState({
                playState: this.props.playState,
            },() => {
                // prevProps hasnt been set or song changed
                if (prevProps.playState === null || prevProps.playState?.item.name !== this.props.playState.item.name) {
                    this.updateLyrics();
                }
            });
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
                            this.setState({
                                originalLyrics: lyrics,
                                romanizedLyrics: lyrics,
                                isRomanized: false,

                                originalLyricLanguage: origLyricLang,

                                lyricsInfo: info,
                                loaded: true,
                                lyricsSpotifyTrackName: this.state.playState.item,
                            });
                        });
                    } else {
                        // No relevant Genius lyrics found
                        console.log(`No related lyrics found for song '${this.state.playState.item.artists[0].name} - ${this.state.playState.item.name}'`);
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
            romanizedLyrics: null,
            lyricsInfo: null,
            isRomanized: false,
            originalLyricLanguage: ELanguages.NONE,
        });
    }

    onToggleRomanize() {
        if (!this.state.originalLyrics) {
            return;
        }

        if (this.state.isRomanized) {
            this.setState({
                romanizedLyrics: this.state.originalLyrics,
            });
        } else {
            let romanizedLyrics = "";
            switch(this.state.originalLyricLanguage)
            {
                case ELanguages.JP:
                    {
                        if (!this.state.kuroshiro) { break; }
                        romanizedLyrics = "...";
                        this.state.kuroshiro.convert(this.state.originalLyrics, { 
                            to: "romaji",
                            mode: "spaced",
                        }).then((romajiLyrics) => {
                            // remove double space added inbetween other phrases
                            romajiLyrics = romajiLyrics.replace(/ +(?= )/g,'');
                            this.setState({
                                romanizedLyrics: romajiLyrics,
                            });
                        });
                        break;
                    }
                    case ELanguages.SZH:
                    case ELanguages.TZH:
                        {
                            romanizedLyrics = pinyin4js.convertToPinyinString(this.state.originalLyrics, ' ', pinyin4js.WITH_TONE_MARK)
                            break;
                        }
                    case ELanguages.KR:
                        {
                            romanizedLyrics = Aromanize.romanize(this.state.originalLyrics);
                            break;
                        }
                    case ELanguages.RU:
                        {
                            romanizedLyrics = cyrillicToTranslit().transform(this.state.originalLyrics, " ");
                            break;
                        }
                default:
                    break;
            }
            this.setState({
                romanizedLyrics: romanizedLyrics,
            });
        }

        this.setState({
            isRomanized: !this.state.isRomanized,
        });
    }

    onRetryLyricsBtn() {
        if (!this.state.shouldUpdateLyrics) {
            this.setState({ shouldUpdateLyrics: true }, () => this.updateLyrics() );
            console.log("Retrying lyrics at request of user");
        }
    }
    
    render() {
        return (
            <div className="w-100 lyrics-container py-2">
                <div className="text-center h-100">
                    {
                        !this.state.loaded && <FontAwesomeIcon className="fa-spin" size="3x" icon={faSpinner} />
                    }
                    {/* Lyrics container */}
                    {
                        this.state.romanizedLyrics && this.state.loaded &&
                        <div className="h-100">
                             <div 
                                    className="pr-5 mb-2 text-right d-none d-sm-block"
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
                                            this.state.originalLyricLanguage !== ELanguages.ENG && 
                                            <Form>
                                                <Form.Check
                                                    type="switch"
                                                    id="custom-switch"
                                                    label="Romanize"
                                                    onChange={this.onToggleRomanize}>
                                                </Form.Check>
                                            </Form>
                                            
                                        }
                                </div>
                                <div className="lyrics-content" >
                                    { this.state.romanizedLyrics }
                                </div>
                        </div>
                    }
                    {
                        !this.state.originalLyrics && this.state.loaded && 
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