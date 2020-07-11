import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Cookies from "../../helpers/cookieHelper";
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
            Cookies.setCookie("spotify-auth", stringified);
        } else {
            console.error("No auth saved to cookies, error occured");
        }

        setTimeout(() => {
            this.setState({
                redirect: "/app",
            });
        }, 3000);
    }

    render() {
        return (
            <div
                className="h-100 w-100 spotify-black">
                <h3 className="text-center pt-5">
                    Redirecting...
                </h3>
                {
                    this.state.redirect && <Redirect to={this.state.redirect} />
                }
            </div>
        );
    }
}

export default Callback;