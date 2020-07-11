import React, { Component } from 'react';
import {
    Button
} from "react-bootstrap";

import GeniusService from '../../services/genius';
import "./Lyrics.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

class Lyrics extends Component {
    constructor(props) {
        super(props);

        this.state = {
            playState: props.playState,

            originalLyrics: null,
            lyricsInfo: null,
            loaded: false,
        };

        this.updateLyrics = this.updateLyrics.bind(this);
    }

    componentDidMount() {
        this.updateLyrics();
    }

    componentDidUpdate(prevProps) {
        if(prevProps.playState !== this.props.playState) {
            this.setState({
                playState: this.props.playState,
            }, () => {
                this.updateLyrics();
            });
        }
    }

    updateLyrics() {
        if(this.state.playState && !this.state.loaded) {
            if (this.state.lyricsInfo?.result?.title === this.state.playState.item.name) {
                return;
            }

            GeniusService.search(this.state.playState, (result) => {
                //console.log(result);
                if(result.response.hits.length > 0) {
                    //console.log(result.response.hits[0]);

                    let info = GeniusService.getRelevantResult(result.response.hits, this.state.playState.item);
                    this.setState({
                        lyricsInfo:  info,
                    });

                    if (info) {
                        // Relevant Genius lyrics found
                        console.log(`Relevant Result: ${info.result.full_title}`);
                        GeniusService.parseLyricsFromUrl(info.result.url, (lyrics) => {
                            this.setState({
                                originalLyrics: lyrics.trim(),
                                loaded: true,
                            });
                        });
                    } else {
                        // No Genius lyrics found
                        console.log(`No lyrics found for song '${this.state.playState.item.artists[0].name} - ${this.state.playState.item.name}'`);
                        this.setState({
                            originalLyrics: null,
                            loaded: true,
                        });
                    }
                } else {
                    // No search hits found at all
                    console.log("Didn't find any search results on Genius");
                    this.setState({
                        loaded: true,
                        originalLyrics: null,
                        lyricsInfo: null,
                    });
                }
            });
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
                        this.state.originalLyrics && this.state.loaded &&
                        <div
                            className="lyrics-content" >
                            { this.state.originalLyrics }
                        </div>
                    }
                    {
                        !this.state.originalLyrics && this.state.loaded && 
                                <a href="https://genius.com/new">
                                    <Button variant="outline-light" className="mt-2"> 
                                        Add to Genius
                                    </Button>
                                </a>
                    }
                </div>
            </div>
        );
    }
}

export default Lyrics;