import React, { Component } from 'react';
import { Container } from 'react-bootstrap';

class ContentSelector extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            contentSelectedCallback: props.onContentSelected,
            selections: [
                "lyrics", "settings"
            ],
            selectedSelection: "lyrics",
        }

        this.onSelectContent = this.onSelectContent.bind(this);
    }

    onSelectContent(event) {
        let target = event.target;
     
        this.setState({
            selectedSelection: target.dataset.tag,
        });

        this.state.contentSelectedCallback(target.dataset.tag);
    }

    render() {
        return (
            <div className="genify-nav-bg w-100">
                <Container 
                    className="h-100 d-flex align-items-center genify-light-background">
                    {
                        this.state.selections && this.state.selections.map((value, index) => {
                            return (
                                <div    
                                    onClick={this.onSelectContent}
                                    className={`content-selector-item mx-auto ${this.state.selectedSelection === value && "active-selection"}`}
                                    data-tag={value}
                                    key={value}>
                                    <h6 
                                        data-tag={value}
                                        className="m-0">{value}</h6>
                                </div>
                            )
                        })
                    }                    
                </Container>
            </div>
        );
    }
}

export default ContentSelector;