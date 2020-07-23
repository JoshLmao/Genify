import React, { Component } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { EGenifyCookieNames } from '../../enums/cookies';
import { Redirect } from 'react-router-dom';
import Cookies from "js-cookie";
import SpotifyService from '../../services/spotify';

function SettingNameValue(props) {
    return (
        <div className="d-flex" {...props}>
            <div>
                {props.name}
            </div>
            <div className="ml-auto">
                {props.value}
            </div>
        </div>
    )
}

class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auth: props.auth,

            redirect: "",

            userProfile: null,
        };

        this.onSpotifySignOut = this.onSpotifySignOut.bind(this);
    }

    componentDidMount() {
        // Fetch data from spotify
        if (this.state.auth) {
            SpotifyService.getCurrentUserProfile(this.state.auth.authToken, (profileData) => {
                //console.log(profileData);
                this.setState({
                    userProfile: profileData,
                });
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.auth !== this.props.auth) {
            this.setState({
                auth: this.props.auth,
            });
        }
    }

    onSpotifySignOut() {
        console.log("Signing out of Genify");

        // Remove cookie by setting it to blank
        if(Cookies.get(EGenifyCookieNames.SPOTIFY_AUTH)) {
            Cookies.set(EGenifyCookieNames.SPOTIFY_AUTH, "", { path: '', expires: 365 });
        }

        this.setState({
            redirect: "/",
        });
    }

    render() {
        return (
            <div className="w-100 h-100">
                <Container className="py-2 px-5 scrollable-main-content">
                    <h2 className="mb-4">App Settings</h2>

                    <h5>Spotify</h5>
                    {/* User Overview */}
                    <div className="d-flex px-3 my-3">
                        <img
                            alt="Signed in user icon"
                            src={this.state.userProfile?.images[0]?.url} 
                            style={{ maxHeight: "50px", maxWidth: "50px" }} />
                            <div className="px-3">
                                <h6>{this.state.userProfile?.display_name}</h6>
                                <h6
                                    style={{ color: "rgb(200, 200, 200)", fontSize: "0.8rem" }}>
                                    {"SPOTIFY " + this.state.userProfile?.product.toUpperCase()}
                                </h6>
                            </div>
                            <a 
                                href={this.state.userProfile?.external_urls?.spotify}
                                target="noopener"
                                className="ml-auto">
                                <Button variant="outline-success">
                                    Profile
                                </Button>
                            </a>
                    </div>
                    <SettingNameValue name="Account Id" value={this.state.userProfile?.id} />
                    <SettingNameValue name="Followers" value={this.state.userProfile?.followers?.total} />
                    <SettingNameValue name="Region" value={this.state.userProfile?.country} />
                    <SettingNameValue name="Enable Web Playback" value="Coming Soon..." />
                    <div className="w-100 text-right my-2">
                        <Button
                            variant="success"
                            onClick={this.onSpotifySignOut}>
                            <FontAwesomeIcon 
                                className="mr-2"
                                icon={faSpotify} />
                            Sign Out
                        </Button>
                    </div>
                    
                    <div className="horizontal-separator" />

                    <h5>Language</h5>
                    <SettingNameValue name="Automatic Romanize" value="Coming Soon..." />

                    <div className="horizontal-separator" />
            
                    <h4>Credits</h4>
                    <div className="d-flex mb-2">
                        <p className="my-0">Created By</p>
                        <div className="ml-auto d-flex">
                            <a href="https://joshlmao.com" className="mx-2">
                                <p className="my-0">JoshLmao</p>
                            </a>
                            <a href="https://github.com/JoshLmao" target="noopener" className="mx-2">
                                <FontAwesomeIcon icon={faGithub} />
                            </a>
                            <a href="https://twitter.com/JoshLmao" target="noopener" className="mx-2">
                                <FontAwesomeIcon icon={faTwitter} />
                            </a>
                        </div>
                    </div>

                    <p>If you enjoy this app, please consider supporting me through one of the options below. If not, thank you for using and enjoying the app! <span role="img" aria-label="hug emoji">🤗</span></p>
                    <p className="text-center">
                        <a 
                            href="https://github.com/sponsors/JoshLmao"
                            className="m-2">
                            <img 
                                alt="Github Sponsor Advert"
                                src={process.env.PUBLIC_URL + '/img/github-sponsor.png'} 
                                className="my-2"
                                height="50px"/>
                        </a>
                        <a 
                            href="https://brave.com/jos677" 
                                className="m-2">
                            <img 
                                alt="Brave Browser advert"
                                src={process.env.PUBLIC_URL + '/img/BraveBat.png'} 
                                className="my-2"
                                style={{ height: "40px" }} />
                        </a>
                        <a 
                            href="https://paypal.me/xjoshlmao"
                            className="m-2">
                            <img 
                                alt="Paypal Donation Advert"
                                src="https://i.imgur.com/UfSd0gP.png" 
                                className="my-2"
                                style={{ height: "50px" }} />
                        </a>
                    </p>

                </Container>
                {
                    this.state.redirect && <Redirect to={this.state.redirect} />
                }
            </div>
        );
    }
}

export default Settings;