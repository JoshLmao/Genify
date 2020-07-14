import React, { Component } from 'react';
import { Row, Container, Button } from "react-bootstrap";
import { Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

class FourOhFour extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: "",
        };

        this.onReturn = this.onReturn.bind(this);
    }

    onReturn() {
        this.setState({
            redirect: "/",
        });
    }

    render() {
        return (
            <Row
                className="w-100 spotify-black genify-home px-0">
                <Container className="pt-5">
                    <h2 className="text-center pt-5">
                        Error 404: Page Not Found
                    </h2>
                    <h6 className="text-center">
                        你迷路了吗？
                    </h6>
                    <div className="py-3"></div>
                    <h5 className="mx-auto">
                        This page can't be found. Are you sure you typed it in correctly?
                    </h5>
                    <div className="mx-auto">
                        <Button  className="mx-auto"
                            onClick={this.onReturn}
                            variant="outline-light">
                                <FontAwesomeIcon 
                                    icon={faHome}
                                    className="mr-2" />
                                Click here to get right back to the music
                        </Button>
                    </div>
                </Container>
                {
                    this.state.redirect && <Redirect to={this.state.redirect}>here</Redirect>
                }
            </Row>
        );
    }
}

export default FourOhFour;