import React, { Component } from 'react';
import {Alert} from 'react-bootstrap';
import PropTypes from "prop-types";

export class ToasterAlert extends Component
{
    static propTypes = {
        onDismiss: PropTypes.func,
        children: PropTypes.any,
        timeout: PropTypes.number
    };

    state = {
        showToasterAlert: true
    };

    timeoutId = window.setTimeout(() => this.setState({showToasterAlert: false}, ()=>
    {
        if (this.props.onDismiss) {
            this.props.onDismiss();
        }

        window.clearTimeout(this.timeoutId);
    }), this.props.timeout);

    /**
     * Lifecycle hook - componentWillUnmount
     */
    componentWillUnmount()
    {
        if (this.timeoutId && this.timeoutId > 0) {
            window.clearTimeout(this.timeoutId)
        }
    }

    render()
    {
        return(
            <div>
                {this.state.showToasterAlert &&
                    <Alert {...this.props}>
                        {this.props.children}
                    </Alert>
                }
            </div>
        );
    }
}
