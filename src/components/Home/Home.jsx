import React, { Component } from 'react';
import { 
    Container,
    Button,
    Row,
    Toast
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons';
import { Redirect } from "react-router-dom";
import Cookies from "js-cookie";

import SpotifyService from "../../services/spotify";
import { EGenifyCookieNames } from "../../enums/cookies";

import "./Home.css";
import { tryParseJSON } from '../../helpers/general';

/// Handles converting an auth error code to an error message
function getAuthMessage(authStatus) {
    switch(authStatus)
    {
        case "invalid":
            return "A problem has occured trying to use a previous authorizatino. Please try again";
        case "expired":
            return "User's authorization has expired. Please sign in again";
        case "refresh_error":
            return "An error occured when attempting to refresh the previous Spotify authorization. Please sign in again";
        case "state_error":
            return "The recieved state doesn't match. If you are trying to manipulate the requests, please dont :)";
        case "access_denied":
            return "You have denied access to your authorization. Genify needs your permission to continue. Click 'Sign In' to try again"
        default:
            return "Unknown error. Sorry, you shouldn't see this";
    }
}

class Home extends Component {
    constructor(props) {
        super(props);

        // Check if auth expired or invalid
        var params = new URLSearchParams(this.props.location.search);
        var authStatus = params.get('auth');

        this.state = {
            authStatus: authStatus,
            showAuthError: authStatus !== null,
            redirect: null,
        };

        this.onGetSpotifyAuth = this.onGetSpotifyAuth.bind(this);
    }

    onGetSpotifyAuth() {
        let prevAuthStr = Cookies.get(EGenifyCookieNames.SPOTIFY_AUTH, { path: '' });
        if(prevAuthStr)
        {
            let prevAuth = tryParseJSON(prevAuthStr);
            if (prevAuth !== null && prevAuth.refreshToken) {
                this.setState({
                    redirect: "/app",
                });
                // Return once auth has been validated
                return;
            }
        }
        
        // No auth stored, ask for auth from the user
        let url = SpotifyService.getPKCEAuthUri();
        window.location = url;
    }

    render() {
        return (
            <div className="text-center genify-home splash-gradiant text-white">
                <Row className="h-100 mx-0">
                    <Container className="my-auto">
                        <h1 
                            style={{ fontSize: "3rem", fontWeight: "300" }}>
                            Genify
                        </h1>
                        <h4 
                            style={{ fontWeight: "300" }}
                            className="py-2">
                            Combining music, lyrics and video
                        </h4>
                        <Button
                            className="spotify-background py-2 px-5"
                            style={{ fontSize: "1.25rem", width: "250px" }}
                            onClick={this.onGetSpotifyAuth}>
                            <FontAwesomeIcon icon={faSpotify} className="mr-2" />
                            Sign In
                        </Button>
                        <div className="mx-auto mt-3">
                            <a href="https://joshlmao.com" className="my-auto mr-2 text-white">
                                JoshLmao
                            </a>
                            <a href="https://twitter.com/joshlmao">
                                <Button 
                                    className="py-0 px-2"
                                    variant="outline-light">
                                    <FontAwesomeIcon icon={faTwitter} />
                                </Button>
                            </a>
                        </div>
                    </Container>
                </Row>
                {
                    this.state.authStatus && 
                        <Toast 
                            show={this.state.showAuthError}
                            onClose={() => this.setState({ showAuthError: false })}
                            className="genify-toast mr-2 mb-2 text-left"
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                            }}>
                            <Toast.Header>
                                <strong className="mr-auto">A Problem Occured</strong>
                                {/* <small>11 mins ago</small> */}
                            </Toast.Header>
                            <Toast.Body>
                                { getAuthMessage(this.state.authStatus) }
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

export default Home;