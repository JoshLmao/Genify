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

import SpotifyService from "../../services/spotify";
import Cookies, { EGenifyCookieNames } from "../../helpers/cookieHelper";

import "./Home.css";

function getAuthMessage(authStatus) {
    switch(authStatus)
    {
        case "invalid":
            return "A problem has occured trying to get the user auth. Please try again";
        case "expired":
            return "User's authorization has expired. Please sign in again";
        default:
            return "Unknown error";
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
        if (Cookies.getCookie(EGenifyCookieNames.SPOTIFY_AUTH) !== null) {
            this.setState({
                redirect: "/app",
            });
        } else {
            // No auth stored, get new auth from user
            let url = SpotifyService.getUserAuthentificationUrl();
            window.location = url;
        }
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
                            <a href="joshlmao.com" className="my-auto mr-2 text-white">
                                JoshLmao
                            </a>
                            <Button variant="outline-light">
                                <FontAwesomeIcon icon={faTwitter} />
                            </Button>
                        </div>
                    </Container>
                </Row>
                {
                    this.state.authStatus && 
                        <Toast 
                            show={this.state.showAuthError}
                            onClose={() => this.setState({ showAuthError: false })}
                            className="mr-2 mb-2 text-left"
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                color: "black",
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