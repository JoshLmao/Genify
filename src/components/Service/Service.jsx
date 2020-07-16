import React, { Component } from 'react';
import {
    Row,
    Toast,
} from "react-bootstrap";
import {
    PLAYER_UPDATE_MS,
    SPOTIFY_REFRESH_MINUTES
} from "../../consts";
import { Redirect } from 'react-router-dom';

import Player from "../Player";
import SpotifyService from "../../services/spotify";
import { hasAuthExpired } from "../../helpers/spotifyHelper";
import Cookies, { EGenifyCookieNames } from "../../helpers/cookieHelper";
import Lyrics from '../Lyrics/Lyrics';

class Service extends Component {
    constructor(props) {
        super(props);

        // Retrieve saved auth in cookies
        let redirect = "";
        let authStringified = Cookies.getCookie(EGenifyCookieNames.SPOTIFY_AUTH);
        let auth = JSON.parse(authStringified);
        let isRefreshing = false;
        if (auth === null) {
            redirect = "/?auth=invalid";
            console.log("No or auth found in cookies, going home");
        } else {
            auth.expireDate = new Date(auth.expireDate);

            // Check if auth has expired
            if (auth.expireDate < Date.now()) {
                // If auth has a refresh token, use it to refresh otherwise delete and redirect user to home
                if(auth.refreshToken) {
                    console.log(`Auth expired at '${auth.expireDate.toLocaleString()}'. Using refreshToken to get new auth'`);
                    isRefreshing = true;
                    this.refreshAuth(auth.refreshToken);
                } else {
                    Cookies.deleteCookie(EGenifyCookieNames.SPOTIFY_AUTH);
                    redirect = "/?auth=expired";
                    console.log("Auth found but has expired");
                }
            } else {
                console.log(`Auth found. Expires at '${auth.expireDate.toLocaleString()}'`);
            }
        }

        this.state = {
            auth: auth,
            isRefreshingAuth: isRefreshing,
            /// Timeout handle for auto refreshing auth
            refreshAuthRoutine: null,
            /// Interval handle for updating the current Spotify context
            spotifyUpdateRoutine: null,

            infoMessage: "",
            showInfoMessage: false,

            redirect: redirect,
        };

        this.initService = this.initService.bind(this);
        this.refreshAuth = this.refreshAuth.bind(this);
    }
    
    componentDidMount() {
        // If contains no auth and not refreshing, return home
        if(this.state.auth === null && !this.state.isRefreshingAuth) {
            this.setState({ redirect: "/?auth=invalid" });
        }
            
        /// If contains a previous auth that is within expiry
        if (this.state.auth !== null && !this.state.isRefreshingAuth) {
            this.initService();
        }
    }

    /// Initializes the service to perform the relevant actions on start
    initService () {
        // Get inital Spotify track status
        SpotifyService.getCurrentPlaybackState(this.state.auth.authToken, (data) => {
            this.setState({
                playState: data,
                loaded: true,
            });
        });

        if(!this.state.spotifyUpdateRoutine) {
            // Start auto retrieval of Spotify track status
            let spotifyUpdateRoutine = setInterval(() => {
                if (hasAuthExpired(this.state.auth)) {
                    return;
                }
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

            this.setState({ updateRoutine: spotifyUpdateRoutine });
        }

        if (!this.state.refreshAuthRoutine) {
            let expireMs = this.state.auth.expireDate - new Date(Date.now());
            let refreshAuthRoutine = setTimeout(() => {
                console.log(`Auth will expire in ${SPOTIFY_REFRESH_MINUTES} minute(s). Refreshing...`);
                this.setState({
                    refreshAuthRoutine: null,
                });
                this.refreshAuth(this.state.auth.refreshToken);
            }, expireMs - SPOTIFY_REFRESH_MINUTES * 60 * 1000);

            this.setState({
                refreshAuthRoutine: refreshAuthRoutine,
            });
        }
    }

    /// Performes a refresh of the current Spotify auth
    refreshAuth (refreshToken) {
        this.setState({
            isRefreshingAuth: true,
        });

        SpotifyService.refreshAuth(refreshToken, (refreshedAuth) => {
            let auth = SpotifyService.parseAuth(refreshedAuth);
            if(auth) {
                console.log(`Successfully refreshed auth. Expires at '${auth.expireDate.toLocaleString()}'`);
                let stringified = JSON.stringify(auth);
                Cookies.setCookie(EGenifyCookieNames.SPOTIFY_AUTH, stringified);
            } else {
                // Unable to refresh the previous auth
                console.error("Error when trying to refresh auth");
                Cookies.deleteCookie(EGenifyCookieNames.SPOTIFY_AUTH);
                this.setState({ redirect: "/?auth=refresh_error" })
            }

            this.setState({
                isRefreshingAuth: false,
                auth: auth,
            }, () => {
                this.initService();
            });
        });
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