import React, { Component } from 'react';
import {
    Navbar,
    Nav,
    Container,
    Button,
    Modal,
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

import changelogs from "../../json/changelog.json";

function getChangelog() {
    return changelogs.logs.map((log) => {
        return (
            <div>
                <h3>{log.version}</h3>
                <ul>
                    {
                        log.changes.map((change) => {
                            return (
                                <li>{change}</li>
                            );
                        })
                    }
                </ul>
            </div>
        )
    });
}

class Navigation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displayChangelog: false,
        };

        this.toggleChangelog = this.toggleChangelog.bind(this);
    }

    toggleChangelog() {
        this.setState({
            displayChangelog: !this.state.displayChangelog,
        });
    }

    render() {
        return (
            <div className="genify-navbar">
                <Navbar 
                    expand="lg" 
                    style={{ backgroundColor: "#111111" }}>
                    <Container>
                        <Navbar.Brand href="#" className="text-white">Genify</Navbar.Brand>
                        <Nav.Link 
                            className="p-0 align-bottom mt-1"
                            style={{ fontSize: "0.85rem" }}
                            href="" 
                            onClick={this.toggleChangelog}>v1.2.3</Nav.Link>
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
                {
                    this.state.displayChangelog &&
                    <Modal
                        size="lg"
                        show={this.state.displayChangelog}
                        onHide={() => this.toggleChangelog()}>
                        <Modal.Header closeButton>
                            <Modal.Title id="example-modal-sizes-title-lg">
                                Changelog
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {   
                                getChangelog()
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <Button className="ml-auto" onClick={() => this.toggleChangelog()}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                }
            </div>
        );
    }
}

export default Navigation;