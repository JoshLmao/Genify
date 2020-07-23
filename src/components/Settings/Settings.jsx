import React, { Component } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { EGenifyCookieNames } from '../../enums/cookies';
import { Redirect } from 'react-router-dom';
import Cookies from "js-cookie";

function SettingNameValue(props) {
    return (
        <div class="d-flex" {...props}>
            <div className="">
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
            redirect: "",
        };

        this.onSpotifySignOut = this.onSpotifySignOut.bind(this);
    }

    componentDidMount() {
        // Fetch data from spotify
    }

    onSpotifySignOut() {
        console.log("Signing out of Genify");

        // Remove cookie by setting it to blank
        if(Cookies.get(EGenifyCookieNames.SPOTIFY_AUTH)) {
            Cookies.set(EGenifyCookieNames.SPOTIFY_AUTH, "", { path: '' });
        }

        this.setState({
            redirect: "/",
        });
    }

    render() {
        return (
            <div className="w-100 h-100">
                <Container className="py-2 px-5 scrollable-main-content">
                    <h2>App Settings</h2>

                    <h5>Spotify</h5>
                    <SettingNameValue name="Account Name" value="John Smith" />
                    <SettingNameValue name="Account Id" value="000000000" />
                    <SettingNameValue name="Type" value="Free/Premium" />
                    <SettingNameValue name="Cookies Expire" value="31st December, 2020" />
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
                    <SettingNameValue name="Automatic Romanize" value="Yes/No" />

                    <div className="horizontal-separator" />

                    <h4>Credits</h4>
                    <p className="text-center">
                        <a 
                            href="https://github.com/sponsors/JoshLmao">
                            <img 
                                alt="Github Sponsor Advert"
                                src={process.env.PUBLIC_URL + '/img/github-sponsor.png'} 
                                height="60px"/>
                        </a>
                    </p>
                    <p 
                        className="text-center">
                        <a 
                            href="https://brave.com/jos677" 
                                className="mr-1">
                            <img 
                                alt="Brave Browser advert"
                                src={process.env.PUBLIC_URL + '/img/BraveBat.png'} 
                                style={{ height: "50px" }} />
                        </a>
                        <a 
                            href="https://paypal.me/xjoshlmao">
                            <img 
                                alt="Paypal Donation Advert"
                                src="https://i.imgur.com/UfSd0gP.png" 
                                style={{ height: "60px" }} />
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