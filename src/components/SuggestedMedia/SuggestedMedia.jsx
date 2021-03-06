import React, { Component } from 'react';
import SpotifyService from '../../services/spotify';
import { 
    Row,
    Col,
    ListGroup,
    ListGroupItem,
    Container,
    Modal,
    Form,
    Button
} from 'react-bootstrap';
import { ETimeRange } from "../../enums/spotify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

function MediaListItem(props) {
    return (
        <ListGroupItem 
            action 
            data-uri={props.uri}
            data-index={props.index}
            onClick={props.onSelectMedia}
            className="">
            <div className="d-flex" style={{ pointerEvents: "none" }}>
                <img 
                    src={props.mediaArtUrl} 
                    alt={props.mediaTitle}
                    className="pr-2" 
                    height={props.height} />
                <div className="my-auto text-left">
                    <h5 
                        className="mb-0">
                        {props.mediaTitle}
                    </h5>
                    <h6 
                        className="mb-0"
                        style={{ fontSize: "1rem"}}>
                        {props.mediaSubtitle}
                    </h6>
                </div>
            </div>
        </ListGroupItem>
    )
}

class SuggestedMedia extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auth: props.auth,
            suggestAmount: props.suggestAmount ?? 5,
            suggestTerm: props.suggestTerm ?? ETimeRange.SHORT,

            topTracks: null,
            recentPlayed: null,
            devices: null,
            loadedTracks: false,
            loadedPlayed: false,

            // Chosed uri of suggested media
            selectedTrackURI: null,
            // The device id to play the selectedTrackURI on
            selectedDeviceId: null,
            // Should the modal to choose a playback device be shown?
            showDeviceModal: false,
        };

        this.updateSpotifyData = this.updateSpotifyData.bind(this);
        this.getTracks = this.getTracks.bind(this);
        this.getRecentPlayed = this.getRecentPlayed.bind(this);
        this.onSelectTrack = this.onSelectTrack.bind(this);
        this.onSelectRecentTrack = this.onSelectRecentTrack.bind(this);

        this.toggleDeviceModal = this.toggleDeviceModal.bind(this);
        this.confirmDeviceChoice = this.confirmDeviceChoice.bind(this);
        this.onChangedSelectedDevice = this.onChangedSelectedDevice.bind(this);
    }

    componentDidMount() {
        this.updateSpotifyData();
    }

    componentDidUpdate(prevProps) {
        if(prevProps.auth !== this.props.auth) {
            this.setState({ 
                auth: this.props.auth
            }, () => {
                this.updateSpotifyData();
            });
        }
        if(prevProps.suggestAmount !== this.props.suggestAmount) {
            this.setState({ suggestAmount: this.props.suggestAmount });
        }
    }

    updateSpotifyData() {
        this.setState({
            loadedPlayed: false,
            loadedTracks: false,
        });
        this.getTracks();
        this.getRecentPlayed();

        SpotifyService.getPlaybackDevices(this.state.auth.authToken, (devices) => {
            this.setState({
                devices: devices.devices,
                selectedDeviceId: devices.devices.length > 0 ? devices.devices[0].id : null,
            });
        })
    }

    getTracks() {
        if(this.state.auth) {
            SpotifyService.getUsersTopTracks(this.state.auth.authToken, this.state.suggestAmount, this.state.suggestTerm, (tracks) => {
                this.setState({
                    topTracks: tracks,
                    loadedTracks: true,
                });
            })            
        }
    }

    getRecentPlayed() {
        if(this.state.auth) {
            SpotifyService.getUsersRecentlyPlayed(this.state.auth.authToken, 50, (tracks) => {
                /// Credit https://stackoverflow.com/a/38571132/11593118
                // Shuffle array
                const shuffled = tracks.items.sort(() => 0.5 - Math.random());
                // Get sub-array of first n elements after shuffled
                let selected = shuffled.slice(0, this.state.suggestAmount);
                // Keep original Spotify object, re-set the items array to selected
                tracks.items = selected;
                this.setState({
                    recentPlayed: tracks,
                    loadedPlayed: true,
                });
            })
        }
    }

    onSelectTrack(event) {
        let topTrackIndex = parseInt(event.target.dataset.index);
        if (topTrackIndex >= 0) {
            this.setState({
                selectedTopTrackIndex: topTrackIndex,
                showDeviceModal: true,
            });
        }
    }

    onSelectRecentTrack(event) {
        let recentTrackIndex = parseInt(event.target.dataset.index);
        if (recentTrackIndex >= 0) {
            this.setState({
                selectedRecentTrackIndex: recentTrackIndex,
                showDeviceModal: true,
            });
        }
    }

    toggleDeviceModal() {
        this.setState({
            showDeviceModal: !this.state.showDeviceModal,
        });
    }

    confirmDeviceChoice() {   
        let track = null;     
        if(this.state.selectedTopTrackIndex >= 0) {
            track = this.state.topTracks.items[this.state.selectedTopTrackIndex];
        } else if(this.state.selectedRecentTrackIndex >= 0) {
            track = this.state.recentPlayed.items[this.state.selectedRecentTrackIndex].track;
        }

        if(track) {
            console.log(`Selected to play '${track.artists[0].name} - ${track.name}' in album '${track.album.uri}' on device '${this.state.selectedDeviceId}'`);
            SpotifyService.playContext(this.state.auth.authToken, this.state.selectedDeviceId, track.album.uri, track.track_number - 1, 0);
        } else {
            console.error("Unable to choose a top or recent track to play");
        }

        // Hide modal and reset selected indexes
        this.toggleDeviceModal();
        this.setState({
            selectedTopTrackIndex: null,
            selectedRecentTrackIndex: null,
        });
    }

    onChangedSelectedDevice(event) {
        let index = event.target.selectedIndex;
        let id = this.state.devices[index].id;
        this.setState({
            selectedDeviceId: id,
        });
    }

    render() {
        let imgHeight = 50;
        return (
            <div className="lyrics-content">
                <Container>
                    <div className="text-center py-3">
                        Hmm... seems you're not listening to anything right now. May I suggest one of these?
                    </div>
                    <Row className="py-2">
                        <Col 
                            className="my-2"
                            md={{
                                span: 5,
                                offset: 1
                            }}>
                            <h5 className="text-center">Top Recent Tracks</h5>
                            {
                                !this.state.loadedTracks && 
                                    <div className="text-center my-3">
                                            <FontAwesomeIcon icon={faSpinner} className="fa-spin mx-auto" size="3x" />
                                    </div>
                            }
                            <ListGroup className="genify-list-group">
                                {
                                    this.state.topTracks && this.state.topTracks.items.map((value, index) => {
                                        return (
                                            <MediaListItem 
                                                key={`top-${index}`}
                                                index={index}
                                                uri={value.uri}
                                                onSelectMedia={this.onSelectTrack}
                                                mediaArtUrl={value.album.images[2].url}
                                                mediaTitle={value.name}
                                                mediaSubtitle={value.artists[0].name}
                                                height={imgHeight} />
                                        )
                                    })
                                }
                            </ListGroup>
                        </Col>
                        <Col 
                            className="my-2"
                            md={{
                                span: 5,
                                offset: 1
                            }}>
                            <h5 className="text-center">Recently Played</h5>
                            {
                                !this.state.loadedPlayed && 
                                    <div className="text-center my-3">
                                         <FontAwesomeIcon icon={faSpinner} className="fa-spin" size="3x" />
                                    </div>
                            }
                            <ListGroup className="genify-list-group">
                                {
                                    this.state.recentPlayed && this.state.recentPlayed.items.map((value, index) => {
                                        if (value.type === "artist") {
                                            return <h5>{value.name}</h5>
                                        } else {
                                            return (
                                                <MediaListItem 
                                                    key={`played-${index}`}
                                                    index={index}
                                                    uri={value.track.uri}
                                                    onSelectMedia={this.onSelectRecentTrack}
                                                    mediaArtUrl={value.track.album.images[0].url}
                                                    mediaTitle={value.track.name}
                                                    mediaSubtitle={value.track.artists[0].name} 
                                                    height={imgHeight} />
                                            )
                                        }
                                    })
                                }
                            </ListGroup>
                        </Col>
                    </Row>
                    <Modal 
                        show={this.state.showDeviceModal}
                        onHide={this.toggleDeviceModal}
                        className="genify-modal">
                        <Modal.Header closeButton>
                            <Modal.Title>Select a Playback Device</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="mb-2">
                                Great! Now select a device to start playing music on
                            </div>
                            <Form.Group>
                                <Form.Control as="select" onChange={this.onChangedSelectedDevice} className="genify-select">
                                    {
                                        this.state.devices && this.state.devices.map((value, index) => {
                                            return (
                                                <option 
                                                    key={value.id}
                                                    data-id={value.id}>
                                                    {value.name}
                                                </option>
                                            )
                                        })
                                    }
                                </Form.Control>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-light" onClick={this.toggleDeviceModal}>
                                Close
                            </Button>
                            <Button variant="light" onClick={this.confirmDeviceChoice}>
                                Confirm
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </div>
        );
    }
}

export default SuggestedMedia;