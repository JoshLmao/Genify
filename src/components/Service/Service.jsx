import React, { Component } from 'react';
import {
    Row,
    Toast,
} from "react-bootstrap";
import {
    PLAYER_UPDATE_MS
} from "../../consts";
import { Redirect } from 'react-router-dom';

import Player from "../Player";

import SpotifyService from "../../services/spotify";
import Cookies, { EGenifyCookieNames } from "../../helpers/cookieHelper";
import Lyrics from '../Lyrics/Lyrics';

class Service extends Component {
    constructor(props) {
        super(props);

        // Retrieve saved auth in cookies
        let redirect = "";
        let authStringified = Cookies.getCookie(EGenifyCookieNames.SPOTIFY_AUTH);
        let auth = JSON.parse(authStringified);
        if (auth === null) {
            redirect = "/?auth=invalid";
            console.log("No or auth found in cookies, going home");
        } else {
            auth.expireDate = new Date(auth.expireDate);

            if (auth.expireDate < Date.now()) {
                Cookies.deleteCookie(EGenifyCookieNames.SPOTIFY_AUTH);
                redirect = "/?auth=expired";
                console.log("Auth found but has expired");
            } else {
                console.log(`Auth found. Expires at '${auth.expireDate.toLocaleString()}'`);
            }
        }

        this.state = {
            auth: auth,

            infoMessage: "",
            showInfoMessage: false,

            redirect: redirect,
        };
    }
    
    componentDidMount() {
        if(this.state.auth === null ){
            // Redirect to home if auth is invalid
            this.setState({
                redirect: "/?auth=invalid",
            });
        } else {
            // Get inital Spotify track status
            SpotifyService.getCurrentPlaybackState(this.state.auth.authToken, (data) => {
                console.log(data);
                this.setState({
                    playState: data,
                    loaded: true,
                });
            });
    
            // Start auto retrieval of Spotify track status
            setInterval(() => {
                SpotifyService.getCurrentPlaybackState(this.state.auth.authToken, (data) => {
                    // If track changed
                    if (data.item?.name !== this.state.playState.item?.name) {
                        console.log(`TRACK CHANGED | ${data.item.artists[0].name} - ${data.item?.name}`);
                    }
                    this.setState({
                        playState: data,
                    });
                });
            }, PLAYER_UPDATE_MS);

            // Set timer when auth expired
            let expireMs = this.state.auth.expireDate - new Date(Date.now());
            setTimeout(() => {
                console.log("showing info message");
                this.setState({
                    infoMessage: "User authorization is about to expire in one minute",
                    showInfoMessage: true,
                });
            }, expireMs - 1 * 60 * 1000);
        }
    }

    render() {
        return (
            <div
                className="genify-home spotify-black">
                <Row className="mx-0">
                    <Player 
                        playState={this.state.playState}
                        authToken={this.state.auth?.authToken} />
                </Row>
                <Lyrics 
                    playState={this.state.playState} />
                {
                    this.state.infoMessage &&
                    <Toast 
                        show={this.state.showInfoMessage}
                        onClose={() => this.setState({ showInfoMessage: false })}
                        className="mr-2 mb-2 text-left"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            color: "black",
                        }}>
                        <Toast.Header>
                            <strong className="mr-auto">Info</strong>
                            {/* <small>11 mins ago</small> */}
                        </Toast.Header>
                        <Toast.Body>
                            { this.state.infoMessage }
                        </Toast.Body>
                    </Toast>
                }

                {
                    this.state.redirect && <Redirect to={this.state.redirect} />
                }
            </div>
        );
    }
}

export default Service;