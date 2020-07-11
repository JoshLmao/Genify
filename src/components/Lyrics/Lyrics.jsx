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
                originalLyrics: null,

                loaded: false,
            }, () => {
                this.updateLyrics(); 
            });
        }
    }

    updateLyrics() {
        if(this.state.playState) {
            GeniusService.getRelevantResult(this.state.playState, (result) => {
                //console.log(result);
                if(result.response.hits.length > 0) {
                    console.log(result.response.hits[0]);

                    GeniusService.parseLyricsFromUrl(result.response.hits[0].result.url, (lyrics) => {
                        this.setState({
                            originalLyrics: lyrics.trim(),
                            loaded: true,
                        });
                    });
                } else {
                    this.setState({
                        loaded: true,
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