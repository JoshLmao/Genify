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
import ReactMarkdown from "react-markdown";

import {
    TWITTER_LINK,
    GITHUB_LINK
} from "../../consts";

import changelogs from "../../json/changelog.json";
let pkg = require('../../../package.json');

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
        let modalBgColor = "#111";
        let modalSeparatorColor = "#222";
        return (
            <div className="genify-navbar">
                <Navbar 
                    expand="sm" 
                    style={{ backgroundColor: "#111111" }}>
                    <Container>
                        <Navbar.Brand href="/" className="text-white">Genify</Navbar.Brand>
                        <Nav.Link 
                            className="p-0 align-bottom mt-1"
                            style={{ fontSize: "0.85rem" }}
                            href="" 
                            onClick={this.toggleChangelog}>
                                {
                                    pkg ? "v" + pkg.version : "v0.0.0"
                                }
                            </Nav.Link>
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
                        <Modal.Header 
                            closeButton
                            style={{ 
                                backgroundColor: modalBgColor,
                                borderColor: modalSeparatorColor,
                            }}>
                            <Modal.Title id="example-modal-sizes-title-lg">
                                Changelog
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body
                            style={{ 
                                backgroundColor: modalBgColor,
                                borderColor: modalSeparatorColor,
                                fontSize: "0.85rem",
                            }}>
                            {   
                                changelogs.logs.map((log) => {
                                    return (
                                        <div>
                                            <h3>{log.version}</h3>
                                            <ul>
                                                {
                                                    log.changes.map((change) => {
                                                        return (
                                                            <li>
                                                                <ReactMarkdown source={change} className="no-child-margins"/>
                                                            </li>
                                                        );
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    )
                                })
                            }
                        </Modal.Body>
                        <Modal.Footer
                            style={{ 
                                backgroundColor: modalBgColor,
                                borderColor: modalSeparatorColor,
                            }}>
                            <Button 
                                variant="outline-light"
                                className="ml-auto" onClick={() => { this.toggleChangelog(); console.log("updating"); }}>
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