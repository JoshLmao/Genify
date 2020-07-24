import React, { Component } from 'react';
import {
    Popover,
    ListGroup,
    OverlayTrigger,
    Button,
} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner,
    faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import {
    deviceTypeToIcon
} from "../../helpers/spotifyHelper";
import SpotifyService from '../../services/spotify';

class DevicesPopover extends Component {
    constructor(props) {
        super(props);

        this.state = {
            devices: props.devices,
            auth: props.auth,

            showDevicesPopover: false,
            popoverLocationTarget: null,
        };

        this.onSelectPlaybackDevice = this.onSelectPlaybackDevice.bind(this);
        this.handleDisplayDeviceSelector = this.handleDisplayDeviceSelector.bind(this);
    }

    componentDidUpdate(prevProps) {
        if(prevProps.devices !== this.props.devices) {
            this.setState({ devices: this.props.devices });
        }
        if(prevProps.auth !== this.props.auth) {
            this.setState({ auth: this.props.auth });
        }
    }

    handleDisplayDeviceSelector(event) {
        this.setState({
            showDevicesPopover: !this.state.showDevicesPopover,
            popoverLocationTarget: event.target,
        });
    }

    onSelectPlaybackDevice(event) {
        let deviceId = event.target.dataset.deviceid;
        SpotifyService.setPlaybackDevice(this.state.auth.authToken, deviceId, true);

        // Update local state of devices
        this.state.devices.find(x => x.is_active === true).is_active = false;
        this.state.devices.find(x => x.id === deviceId).is_active = true;
    }

    render() {
        return (
            <OverlayTrigger
                placement="bottom"
                trigger="focus"
                overlay={
                    <Popover 
                        id="devices-popover"
                        className="genify-light-background"
                        {...this.props}>
                        <Popover.Title as="h3" className="playback-devices-title text-center">
                            Connect to a device
                        </Popover.Title>
                        <Popover.Content>
                            <ListGroup variant="flush">
                            {
                                this.state.devices && this.state.devices.map((value, index) => {
                                    return (
                                        <ListGroup.Item 
                                            action 
                                            onClick={this.onSelectPlaybackDevice}
                                            key={value.id}
                                            className={`playback-device-item ${value.is_active ? "active-device" : ""}`}
                                            data-deviceid={value.id}>
                                                <FontAwesomeIcon icon={deviceTypeToIcon(value.type)} className="mr-2"/>
                                            {value.name}
                                        </ListGroup.Item>
                                    );
                                })
                            }
                            {
                                !this.state.devices && <FontAwesomeIcon className="mx-auto text-white" size="2x" icon={faSpinner} spin/>
                            }
                            </ListGroup>
                        </Popover.Content>
                    </Popover>
                }>
                <Button 
                    variant="outline-light" 
                    onClick={this.handleDisplayDeviceSelector}>
                    <FontAwesomeIcon icon={faDesktop} />
                </Button>
            </OverlayTrigger>
        );
    }
}

export default DevicesPopover;