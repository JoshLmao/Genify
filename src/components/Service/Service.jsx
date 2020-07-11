import React, { Component } from 'react';
import {
    Row,
    Col,
    Container,
} from "react-bootstrap";
import {
    PLAYER_UPDATE_MS
} from "../../consts";

import Player from "../Player";

import SpotifyService from "../../services/spotify";
import Lyrics from '../Lyrics/Lyrics';

class Service extends Component {
    constructor(props) {
        super(props);

        let auth = null;
        //console.log(props.location);
        if (props.location?.hash) {
            auth = SpotifyService.parseAuth(props.location.hash.substring(1));
        }

        this.state = {
            auth: auth,
        };

        console.log(auth);
    }
    
    componentDidMount() {
        if(this.state.auth === null ){
            // Redirect to home if auth is invalid
            window.location = "http://localhost:3000/?auth=invalid";
        } else {
            SpotifyService.getCurrentPlaybackState(this.state.auth.authToken, (data) => {
                console.log(data);
                this.setState({
                    playState: data,
                    loaded: true,
                });
            });
    
            setInterval(() => {
                SpotifyService.getCurrentPlaybackState(this.state.auth.authToken, (data) => {
                    // If track changed, update
                    if (data.item?.name !== this.state.playState.item?.name) {
                        console.log(`TRACK CHANGED | ${data.item.artists[0].name} - ${data.item?.name}`);
                        this.setState({
                            playState: data,
                        });
                    }
                });
            }, PLAYER_UPDATE_MS);
        }
    }

    render() {
        return (
            <div
                className="genify-home" 
                style={{ backgroundColor: "rgb(24, 24, 24)" }}>
                <Row className="mx-0">
                    <Player 
                        playState={this.state.playState}/>
                </Row>
                <Lyrics 
                    playState={this.state.playState} />
            </div>
        );
    }
}

export default Service;