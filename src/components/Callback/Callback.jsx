import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import Cookies, { EGenifyCookieNames } from "../../helpers/cookieHelper";
import SpotifyService from "../../services/spotify";

class Callback extends Component {
    constructor(props) {
        super(props);

        let auth = null;
        if (props.location?.hash) {
            auth = SpotifyService.parseAuth(props.location.hash.substring(1));
        }

        this.state = {
            auth: auth,
        };
    }

    componentDidMount() {
        if (this.state.auth) {
            let stringified = JSON.stringify(this.state.auth);
            Cookies.setCookie(EGenifyCookieNames.SPOTIFY_AUTH, stringified);
        } else {
            console.error("No auth saved to cookies, error occured");
        }

        setTimeout(() => {
            this.setState({
                redirect: "/app",
            });
        }, 1000);
    }

    render() {
        return (
            <div
                className="h-100 w-100 spotify-black">
                <h3 className="text-center pt-5">
                    Redirecting...
                </h3>
                <div className="mx-auto" style={{ width: "50px" }}>
                    <FontAwesomeIcon 
                        className="fa-spin"
                        size="3x" 
                        icon={faSpinner} />
                </div>
                {
                    this.state.redirect && <Redirect to={this.state.redirect} />
                }
            </div>
        );
    }
}

export default Callback;