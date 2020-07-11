import React, { Component } from 'react';
import {
    Button
} from "react-bootstrap";

import GeniusService from '../../services/genius';
import "./Lyrics.css";

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
                        });
                    });
                }
            });
        }
    }
    
    render() {
        return (
            <div className="w-100 lyrics-container py-2">
                <div className="text-center h-100">
                    {/* Lyrics container */}
                    {
                        this.state.originalLyrics && 
                        <div
                            className="lyrics-content" >
                            { this.state.originalLyrics }
                        </div>
                    }
                    {
                        !this.state.originalLyrics && 
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