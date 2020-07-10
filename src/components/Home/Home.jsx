import React, { Component } from 'react';
import { 
    Container,
    Button,
    Row
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons';

import SpotifyService from "../../services/spotify";

import "./Home.css";

class Home extends Component {
    constructor(props) {
        super(props);

        this.onGetSpotifyAuth = this.onGetSpotifyAuth.bind(this);
    }

    onGetSpotifyAuth() {
        let url = SpotifyService.getUserAuthentificationUrl();
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
                            <a href="joshlmao.com" className="my-auto mr-2 text-white">
                                JoshLmao
                            </a>
                            <Button variant="outline-light">
                                <FontAwesomeIcon icon={faTwitter} />
                            </Button>
                        </div>                    
                    </Container>
                </Row>
            </div>
        );
    }
}

export default Home;