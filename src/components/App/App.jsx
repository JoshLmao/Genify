import React, { Component } from 'react';
import { 
    Route,
    Switch,
    BrowserRouter
} from 'react-router-dom';

import Home from "../Home";
import Navigation from "../Navigation";
import FourOhFour from "../FourOhFour";
import Service from "../Service";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import Callback from '../Callback/Callback';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Navigation />

                <Switch>
                    {/* Homepage */}
                    <Route exact path="/" component={Home} />
                    {/* Main App service page */}
                    <Route exact path="/app" component={Service} />
                    {/* Spotify callback for retrieving/parsing auth*/}
                    <Route exact path="/callback" component={Callback} />
                    {/* 404 error page handling */}
                    <Route component={FourOhFour} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
