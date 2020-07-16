import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import Cookies, { EGenifyCookieNames } from "../../helpers/cookieHelper";
import SpotifyService from "../../services/spotify";

class Callback extends Component {
    constructor(props) {
        super(props);

        let exchangeData = { };
        if (props.location?.search) {
            /// Remove ? and split by params
            let split = props.location.search.substring(1).split("&");
            if (split.length <= 2) {
                for(let keyValue of split){
                    let kvSplit = keyValue.split('=');
                    if(keyValue.includes("code")) {
                        exchangeData.code = kvSplit[1];
                    } else if(keyValue.includes("state")) {
                        exchangeData.state = kvSplit[1];
                    } else if(keyValue.includes("error")) {
                        exchangeData.error = kvSplit[1];
                    }
                }
            }
        }

        this.state = {
            exchangeData: exchangeData,
        };
    }

    componentDidMount() {
        if(this.state.exchangeData) {
            SpotifyService.exchangePKCECode(this.state.exchangeData.code, (authData) => {
                let auth = SpotifyService.parseAuth(authData);
                if(auth) {
                    let stringified = JSON.stringify(auth);
                    Cookies.setCookie(EGenifyCookieNames.SPOTIFY_AUTH, stringified);
                   
                    console.log("Successfully saved auth! Redirecting...");
                    setTimeout(() => {
                        this.setState({
                            redirect: "/app",
                        });
                    }, 100);
                } else {
                    console.error("Unable to parse and save auth");
                }
            });
        }
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