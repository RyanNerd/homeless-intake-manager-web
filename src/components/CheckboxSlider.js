import React, {Component} from 'react';
import PropTypes from "prop-types";

export class CheckboxSlider extends Component
{
    static propTypes = {
        id: PropTypes.string,
        labelText:PropTypes.string,
        onCheckboxChanged: PropTypes.func
    };

    state = {checkValue: false};

    handleOnChange(e)
    {
        this.setState({checkValue: e.target.value}, ()=>{this.props.onCheckboxChanged(this.state.checkValue)})
    }
    render()
    {
        return (
            <>
                <input
                    className="checkbox-slider"
                    id={this.props.id}
                    type="checkbox"
                    value={this.state.checkValue}
                    onChange={(e)=>this.handleOnChange(e)}
                />
                <label className="checkbox-slider" htmlFor={this.props.id}>{this.props.labelText}</label>
            </>
        )
    }
}

