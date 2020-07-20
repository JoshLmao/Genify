import React, { Component } from 'react';
import {
    Row,
    Col,
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
import RangeSlider from "react-bootstrap-range-slider";

import SpotifyService from '../../services/spotify';
import {
    getFormattedArtists
} from "../../helpers/spotifyHelper";

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
    if (hours !== "") {
        return hours + ":" + minutes + ":" + seconds;
    }
    return minutes + ":" + seconds;
}

/// Gets the largest album art from Spotify
function retrieveAlbumArt(playState) {
    // Default img if no album art found
    let url = "https://via.placeholder.com/75";
    if (playState) {
        if (playState.item.album && playState.item.album.images.length > 0) {   
            // Get biggest (first) art
            let image = playState.item.album.images[0];
            url = image.url;
        }
    } 

    return url;
}

class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auth: props.auth,
            playState: props.playState,

            volumePercent: props.playState ? props.playState.device?.volume_percent : 0,
            trackProgressMs: props.playState ? props.playState.progress_ms : 0,
            isChangingTrackProgress: false,
        };

        this.onPlayPause = this.onPlayPause.bind(this);
        this.onNextTrack = this.onNextTrack.bind(this);
        this.onPreviousTrack = this.onPreviousTrack.bind(this);
        this.onToggleVolumeMute = this.onToggleVolumeMute.bind(this);
        this.onVolumeChanged = this.onVolumeChanged.bind(this);
        this.onFinishVolumeChanged = this.onFinishVolumeChanged.bind(this);
        this.onProgressChanged = this.onProgressChanged.bind(this);
        this.onFinishProgressChanged = this.onFinishProgressChanged.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.playState !== this.props.playState) {
            this.setState({
                playState: this.props.playState,

                volumePercent: this.props.playState?.device?.volume_percent,
                trackProgressMs: this.props.playState?.progress_ms,
            });
        }

        if(prevProps.auth !== this.props.auth) {
            this.setState({
                auth: this.props.auth,
            });
            console.log("Player Auth recieved update");
        }
    }

    onPlayPause() {
        if (this.state.playState) {
            if (this.state.playState.is_playing) {
                SpotifyService.pause(this.state.auth.authToken);
            } else {
                SpotifyService.play(this.state.auth.authToken);
            }
        }
    }

    onNextTrack() {
        SpotifyService.nextTrack(this.state.auth.authToken);
    }
    
    onPreviousTrack() {
        SpotifyService.previousTrack(this.state.auth.authToken);
    }

    onToggleVolumeMute() {
        if (this.state.playState) {
            if (this.state.playState.device?.volume_percent > 0) {
                SpotifyService.setVolume(this.state.auth.authToken, 0);
            } else {
                SpotifyService.setVolume(this.state.auth.authToken, 25);
            }
        }
    }
    
    onVolumeChanged(changedEvent) {
        this.setState({
            volumePercent: parseInt(changedEvent.target.value),
        });
    }

    onFinishVolumeChanged() {
        if(this.state.volumePercent !== this.state.playState.device?.volume_percent) {
            console.log("Web API: Set volume to " + this.state.volumePercent);
            SpotifyService.setVolume(this.state.auth.authToken, this.state.volumePercent);
        }
    }

    onProgressChanged (changedEvent) {
        this.setState({
            trackProgressMs: parseInt(changedEvent.target.value),
        });

        if (!this.state.isChangingTrackProgress) {
            this.setState({ isChangingTrackProgress: true });
        }
    }

    onFinishProgressChanged() {
        if(this.state.playState) {
            if (this.state.playState.progress_ms !== this.state.trackProgressMs) {
                SpotifyService.seek(this.state.auth.authToken, this.state.trackProgressMs);
            }
        }

        this.setState({ isChangingTrackProgress: false });
    }

    render() {
        return (
            <Row 
                className="w-100 mx-0 genify-player"
                style={{ backgroundColor: "rgb(40,40,40)" }}>
                {/* Album Art & Song Info */}
                <Col
                    xl={3}
                    lg={3} 
                    md={4}
                    sm={5}
                    xs={12}>
                    <div className="d-flex align-items-center my-auto">
                        {
                            this.state.playState &&
                            <a 
                                href={ this.state.playState ? this.state.playState.item?.album?.external_urls?.spotify : "#" } 
                                className="ml-2 p-2">
                                <img 
                                    className="album-art" 
                                    alt={ this.state.playState ? this.state.playState.item?.artists[0].name + "Album Art" : "Unknown Album" }
                                    src={ retrieveAlbumArt(this.state.playState) }
                                    style={{ maxWidth: "75px", maxHeight: "75px" }}></img>
                            </a>
                        }
                        <div className="w-100 ml-2">
                            <a 
                                href={ this.state.playState ? this.state.playState.item?.external_urls?.spotify : "#" }>
                                <h6 className="song-info">
                                    { this.state.playState ? this.state.playState.item?.name : "" }
                                </h6>
                            </a>
                            {/* Artists */}
                            <h6 className="song-info">
                                { this.state.playState ? getFormattedArtists(this.state.playState) : "" }
                            </h6>
                        </div>
                    </div>
                    {   
                        !this.state.playState && 
                        <div className="my-auto">
                            <h6>No song currently playing.</h6>
                            <h6>Play a song to get started!</h6>
                        </div>
                    }
                </Col>
                {/* Media Controls */}
                <Col 
                    xl={6}
                    lg={6}
                    md={5}
                    sm={7}
                    className="d-none d-sm-block my-auto">
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
                                { this.state.playState && msToTime(this.state.isChangingTrackProgress ? this.state.trackProgressMs : this.state.playState.progress_ms) }    
                                { !this.state.playState && "0:00" }
                            </h6>
                            <div 
                                className="w-100"
                                onMouseUp={this.onFinishProgressChanged}>
                                <RangeSlider 
                                    value={this.state.trackProgressMs}
                                    min={0}
                                    max={this.state.playState ? this.state.playState.item?.duration_ms : 100}
                                    onChange={this.onProgressChanged}
                                    tooltip="off"
                                    />
                            </div>
                            <h6 className="my-auto mx-2">
                                { this.state.playState && msToTime(this.state.playState.item?.duration_ms) }
                                { !this.state.playState && "9:59" }
                            </h6>
                        </div>
                </Col>
                {/* Volume, Devices */}
                <Col 
                    xl={3}
                    lg={3}
                    md={3} 
                    className="d-none d-md-block my-auto">
                    <div className="d-flex align-items-center">
                        <Button 
                            className="mx-2"
                            variant="outline-light"
                            onClick={this.onToggleVolumeMute}>
                            <FontAwesomeIcon icon={this.state.volumePercent === 0 ? faVolumeMute : faVolumeUp} />
                        </Button>
                        <div 
                            onMouseUp={this.onFinishVolumeChanged}
                            className="w-100">
                            <RangeSlider
                                value={this.state.volumePercent}
                                onChange={this.onVolumeChanged}
                                tooltip="auto"
                                variant='primary' />
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}

export default Player;