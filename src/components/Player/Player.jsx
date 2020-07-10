import React, { Component } from 'react';
import {
    Row,
    Col,
    ProgressBar,
    Button
} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStepBackward,
    faStepForward,
    faPause,
    faPlay,
    faVolumeMute,
    faVolumeUp, 
} from "@fortawesome/free-solid-svg-icons";
import {
    PLAYER_UPDATE_MS
} from "../../consts";

import SpotifyService from "../../services/spotify";

// Formats total milliseconds to a displayable time format (like 00:00)
function msToTime(millisec) {
    var seconds = (millisec / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours != "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            authToken: props.authToken,
            playState: null,
            loaded: false,
        };

        this.onPlayPause = this.onPlayPause.bind(this);
        this.onNextTrack = this.onNextTrack.bind(this);
        this.onPreviousTrack = this.onPreviousTrack.bind(this);
        this.onToggleVolumeMute = this.onToggleVolumeMute.bind(this);
    }

    componentDidMount() {
        SpotifyService.getCurrentPlaybackState(this.state.authToken, (data) => {
            console.log(data);
            this.setState({
                playState: data,
                loaded: true,
            });
        });

        setInterval(() => {
            SpotifyService.getCurrentPlaybackState(this.state.authToken, (data) => {
                this.setState({
                    playState: data,
                });
            });
        }, PLAYER_UPDATE_MS);
    }

    onPlayPause() {
        
    }

    onNextTrack() {

    }
    
    onPreviousTrack() {

    }

    onToggleVolumeMute() {
        if (this.state.playState.device?.volume_percent > 0) {
            
        } else {
            
        }
    }

    render() {
        return (
            <Row 
                className="w-100 mx-0"
                style={{ backgroundColor: "rgb(40,40,40)" }}>
                {/* Album Art & Song Info */}
                <Col md={3}>
                    <div className="d-flex align-items-center my-auto">
                        <a 
                            href={ this.state.playState ? this.state.playState.item?.album?.external_urls?.spotify : "#" } 
                            className="ml-2 p-2">
                            <img 
                                className="album-art" 
                                src={this.state.playState ? this.state.playState?.item?.album?.images[1].url : "https://via.placeholder.com/75"}
                                style={{ maxWidth: "75px", maxHeight: "75px" }}></img>
                        </a>
                        <div className="w-100 ml-2">
                            <a 
                                href={ this.state.playState ? this.state.playState.item?.external_urls?.spotify : "#" }>
                                <h6>
                                    { this.state.playState ? this.state.playState.item?.name : "Unknown" }
                                </h6>
                            </a>
                            <a 
                                href={ this.state.playState ? this.state.playState.item?.artists[0].external_urls?.spotify : "#" }>
                                <h6>
                                    { this.state.playState ? this.state.playState.item?.artists[0].name : "Unknown" }
                                </h6>
                            </a>
                        </div>
                    </div>
                </Col>
                {/* Media Controls */}
                <Col 
                    md={6}
                    className="my-auto">
                    <div className="d-flex align-items-center my-1">
                        <div className="mx-auto my-1">
                            <Button 
                                className="mx-2"
                                variant="outline-light"
                                onClick={this.onPreviousTrack}>
                                <FontAwesomeIcon icon={faStepBackward} />
                            </Button>
                            <Button 
                                className="mx-2"
                                variant="outline-light"
                                onClick={this.onPlayPause}>
                                <FontAwesomeIcon icon={this.state.playState?.is_playing ? faPause : faPlay} />
                            </Button>
                            <Button 
                                className="mx-2"
                                variant="outline-light"
                                onClick={this.onNextTrack}>
                                <FontAwesomeIcon icon={faStepForward} />
                            </Button>
                        </div>
                    </div>
                    <div className="d-flex align-items-center my-1">
                            <h6 className="my-auto mx-2">
                                { this.state.playState && msToTime(this.state.playState.progress_ms) }    
                                { !this.state.playState && "0:00" }
                            </h6>
                            <ProgressBar 
                                className="flex-grow-1"
                                min={0} 
                                max={this.state.playState ? this.state.playState.item?.duration_ms : 100} 
                                now={this.state.playState ? this.state.playState.progress_ms : 50} />
                            <h6 className="my-auto mx-2">
                                { this.state.playState && msToTime(this.state.playState.item?.duration_ms) }
                                { !this.state.playState && "9:59" }
                            </h6>
                        </div>
                </Col>
                {/* Volume, Devices */}
                <Col 
                    md={3} 
                    className="my-auto">
                    <div className="d-flex align-items-center">
                        <Button 
                            className="mx-2"
                            variant="outline-light"
                            onClick={this.onToggleVolumeMute}>
                            <FontAwesomeIcon icon={this.state.volume === 0 ? faVolumeMute : faVolumeUp} />
                        </Button>
                        <ProgressBar 
                            className="flex-grow-1"
                            min={0} 
                            max={100} 
                            now={this.state.playState ? this.state.playState.device?.volume_percent : 50} />
                    </div>
                </Col>
            </Row>
        );
    }
}

export default Player;