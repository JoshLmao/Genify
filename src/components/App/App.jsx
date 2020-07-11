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

function testing(message, callback) {
    // this is the default behavior
    const allowTransition = window.confirm(message);
    callback(allowTransition);
}

class App extends Component {
    render() {
        return (
            <BrowserRouter
                getUserConfirmation={(message, callback) => testing(message, callback)}>
                <Navigation />

                <Switch>
                    {/* Homepage */}
                    <Route exact path="/" component={Home} />
                    {/* Main App service page */}
                    <Route exact path="/app" component={Service} />

                    <Route component={FourOhFour} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
