import React, { Component } from 'react';
import {
    Row,
    Col,
    Container,
} from "react-bootstrap";

import Player from "../Player";

import SpotifyService from "../../services/spotify";

class Service extends Component {
    constructor(props) {
        super(props);

        let auth = null;
        console.log(props.location);
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
            window.location = "http://localhost:3000/?auth=invalid";
        }
    }

    render() {
        return (
            <div
                className="genify-home" 
                style={{ backgroundColor: "rgb(24, 24, 24)" }}>
                <Row className="mx-0">
                    <Player 
                        authToken={this.state.auth?.authToken}/>
                </Row>
            </div>
        );
    }
}

export default Service;