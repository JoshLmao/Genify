import React, { Component } from 'react';
import { 
    HashRouter,
    Route,
    Switch
} from 'react-router-dom';

import Home from "../Home";
import Navigation from "../Navigation";
import FourOhFour from "../FourOhFour";
import Service from "../Service";

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
    render() {
        return (
            <HashRouter>
                <Navigation />

                <Switch>
                    <Route exact path="/" component={Home} />

                    <Route exact path="/service" component={Service} />

                    <Route component={FourOhFour} />
                </Switch>
            </HashRouter>
        );
    }
}

export default App;
