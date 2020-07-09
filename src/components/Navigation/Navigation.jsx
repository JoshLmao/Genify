import React, { Component } from 'react';
import {
    Navbar,
    Nav,
    Container,
    Button,
} from "react-bootstrap";
import { 
    faGithub,
    faTwitter
} from '@fortawesome/free-brands-svg-icons' ;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    TWITTER_LINK,
    GITHUB_LINK
} from "../../consts";

class Navigation extends Component {
    render() {
        return (
            <div>
                <Navbar bg="light" expand="lg">
                    <Container>
                        <Navbar.Brand href="#">Genify</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ml-auto">
                                <Nav.Link className="py-0" href={GITHUB_LINK}>
                                    <Button variant="outline-secondary">
                                        <FontAwesomeIcon icon={faGithub} />
                                    </Button>
                                </Nav.Link>
                                <Nav.Link className="py-0" href={TWITTER_LINK}>
                                    <Button variant="outline-secondary">
                                        <FontAwesomeIcon icon={faTwitter} />
                                    </Button>
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
        );
    }
}

export default Navigation;