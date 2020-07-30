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
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import SpotifyService from "../../services/spotify";
import { EGenifyCookieNames } from "../../enums/cookies";
import { hasAuthExpired } from "../../helpers/spotifyHelper";
import { tryParseJSON } from "../../helpers/general";
import { getArtistsToDisplay } from "../../helpers/spotifyHelper";

import Lyrics from '../Lyrics/Lyrics';
import ContentSelector from "../ContentSelector";
import Settings from "../Settings";
import Player from "../Player";
import SuggestedMedia from "../SuggestedMedia";

class Service extends Component {
    constructor(props) {
        super(props);

        // Retrieve saved auth in cookies
        let redirect = "";
        let auth = null;
        let isRefreshing = false;
        let authStringified = Cookies.get(EGenifyCookieNames.SPOTIFY_AUTH);
        auth = tryParseJSON(authStringified);
        if (auth === null) {
            redirect = "/?auth=invalid";
            console.log("No auth in cookies or corrupted, going home");
        } else {
            auth.expireDate = new Date(auth.expireDate);

            // Check if auth has expired
            if (auth.expireDate < Date.now()) {
                // If auth has a refresh token, use it to refresh otherwise delete and redirect user to home
                if(auth.refreshToken) {
                    console.log(`Auth expired at '${auth.expireDate.toLocaleString()}'. Using refreshToken to get new auth`);
                    isRefreshing = true;
                    this.refreshAuth(auth.refreshToken);
                } else {
                    Cookies.remove(EGenifyCookieNames.SPOTIFY_AUTH);
                    redirect = "/?auth=expired";
                    console.log("Auth found but has expired");
                }
            } else {
                console.log(`Auth found. Expires at '${auth.expireDate.toLocaleString()}'`);
            }
        }

        this.state = {
            auth: auth,
            playState: undefined,

            /// Check if current auth is being refreshed or not
            isRefreshingAuth: isRefreshing,
            /// Timeout handle for auto refreshing auth
            refreshAuthRoutine: null,
            /// Interval handle for updating the current Spotify context
            spotifyUpdateRoutine: null,

            infoMessage: "",
            showInfoMessage: false,

            redirect: redirect,

            mainContentPanel: "lyrics",

            /// Object containing info to display in toast
            toastInfo: null,
        };

        this.initService = this.initService.bind(this);
        this.refreshAuth = this.refreshAuth.bind(this);
        this.processUpdatedState = this.processUpdatedState.bind(this);

        this.onContentPanelSelected = this.onContentPanelSelected.bind(this);
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
        /// Check if the stored auth is compatiable with the latest version
        if(this.state.auth) {
            let reqScopes = SpotifyService.getRequiredScopes();
            if(this.state.auth.scopes.length < reqScopes.length) {
                this.setState({
                    toastInfo: {
                        title: "New authentification required",
                        message: "Genify has been updated recently with new features! Please Sign Out and Sign In again to enable them. You can 'Sign Out' under 'Settings'",
                    },
                });
            }
        }

        // Get inital Spotify track status
        SpotifyService.getCurrentPlaybackState(this.state.auth.authToken, this.processUpdatedState);

        /// Start routine for getting latest Spotify state every X ms
        if(!this.state.spotifyUpdateRoutine) {
            // Start auto retrieval of Spotify track status
            let spotifyUpdateRoutine = setInterval(() => {
                if (hasAuthExpired(this.state.auth)) {
                    return;
                }
                SpotifyService.getCurrentPlaybackState(this.state.auth.authToken, this.processUpdatedState);
            }, PLAYER_UPDATE_MS);

            this.setState({ updateRoutine: spotifyUpdateRoutine });
        }

        /// Start routine for refreshing auth once near expiry
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

    processUpdatedState(data) {
        /// If no data & no playState as set in constructor
        // or no data and valid previous playState
        if ((!data && this.state.playState === undefined) || (!data && this.state.playState)) {
            console.log(`SPOTIFY INACTIVE`);
        } else if (data?.item?.name !== this.state.playState?.item?.name) {
            console.log("SPOTIFY TRACK CHANGED | " + getArtistsToDisplay(data) + " - " + data.item.name);
        }
        this.setState({
            playState: data,
        });
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
                Cookies.set(EGenifyCookieNames.SPOTIFY_AUTH, stringified, { path: '', expires: 365 });
            } else {
                // Unable to refresh the previous auth
                console.error("Error when trying to refresh auth");
                Cookies.remove(EGenifyCookieNames.SPOTIFY_AUTH);
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

    onContentPanelSelected(panel) {
        if (panel !== this.state.mainContentPanel) {
            //console.log(`Content changed to '${panel}'`);
            this.setState({
                mainContentPanel: panel,
            });
        }
    }

    render() {
        return (
            <div
                className="genify-home genify-dark-background">
                <Row className="mx-0">
                    <Player 
                        playState={this.state.playState}
                        auth={this.state.auth} />
                </Row>
                {/* Main content selection nav */}
                <div className="main-content-container">
                    <Row
                        className="content-nav mx-0">
                        <ContentSelector 
                            onContentSelected={this.onContentPanelSelected} />
                    </Row>
                    <Row className="focused-content-container mx-0">
                        <div className={"w-100 h-100 " + (this.state.mainContentPanel === "lyrics" ? "d-block" : "d-none")} >
                            {
                                this.state.isRefreshingAuth && 
                                    <div className="text-center my-3">
                                        <h6>Refreshing user authentification...</h6>
                                        <FontAwesomeIcon className="fa-spin" size="3x" icon={faSpinner} />
                                    </div>
                            }
                            {
                                // Show lyrics when not refreshing auth and playState isn't initially undefined and playState IS valid
                                !this.state.isRefreshingAuth && this.state.playState !== undefined && this.state.playState !== null &&
                                    <Lyrics
                                        playState={this.state.playState}
                                        auth={this.state.auth} />
                            }
                            {
                                // Show Suggested if not refreshing auth and playState isn't initially undefined BUT is null (null set from spotifyUpdateRoutine)
                                !this.state.isRefreshingAuth && this.state.playState !== undefined && this.state.playState === null &&
                                    <SuggestedMedia 
                                        auth={this.state.auth}
                                        suggestAmount={5} />
                            }
                        </div>
                        <div className={"w-100 h-100 " + (this.state.mainContentPanel === "settings" ? "d-block" : "d-none")}>
                            <Settings auth={this.state.auth} />
                        </div>
                    </Row>
                </div>

                {
                    this.state.redirect && <Redirect to={this.state.redirect} />
                }

                {
                    this.state.toastInfo && 
                        <Toast
                            className="genify-toast m-2 mr-4"
                            show={this.state.toastInfo !== null}
                            onClose={() => this.setState({ toastInfo: null })}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                            }}>
                            <Toast.Header>
                                <div className="mr-auto">
                                    <strong>{this.state.toastInfo.title}</strong>
                                </div>
                            </Toast.Header>
                            <Toast.Body>
                                {this.state.toastInfo.message}
                            </Toast.Body>
                        </Toast>
                }
            </div>
        );
    }
}

export default Service;