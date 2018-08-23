import * as React from "react";
import {Component} from "react";
import {ContextType, StoreConsumer} from "./StoreContext";
import {CountyProvider} from "../providers/CountyProvider";
import {CountyType} from "../models/CountyModel";
import {ChangeEvent} from "react";

interface Props {
    selectedCounty: string
    countyProvider?: CountyProvider
    className: string
    stateCode: string
    onSelected: Function
    context?: ContextType
}

const stringOrNull: string | null = null;
const initialCounties: CountyType[] | null = null;
const initialState = {
    selectedCounty: stringOrNull,
    stateCode: stringOrNull,
    counties: initialCounties
};
type State = Readonly<typeof initialState>;

export const CountyDropdown = (props: Props) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <CountyDropdownBase
                context={context}
                countyProvider={new CountyProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * CountyDropdown Class
 */
class CountyDropdownBase extends Component<Props, State>
{
    readonly state: State = initialState;

    /**
     * Lifecycle hook - getDerivedStateFromProps
     *
     * @param {object} nextProps
     * @param {object} prevState
     * @return {object | null}
     */
    static getDerivedStateFromProps(nextProps: Props, prevState: State): State | null
    {
        if (nextProps.stateCode !== prevState.stateCode) {
            return {stateCode: nextProps.stateCode, counties: null, selectedCounty: null}
        }

        return null;
    }

    /**
     * Lifecycle hook - componentDidUpdate
     *
     * @param {object} prevProps
     * @param {object} prevState
     */
    componentDidUpdate(prevProps: Props, prevState: State)
    {
        if (this.props.stateCode && this.state.counties === null) {
            this.props.countyProvider.read(this.props.stateCode)
            .then((response)=>
            {
                if (response.success) {
                    this.setState({counties: response.data, stateCode: this.props.stateCode})
                } else {
                    this.onError(response);
                }
            })
            .catch((error)=>
            {
                this.onError(error);
            });
        }

        if (this.props.selectedCounty !== prevState.selectedCounty) {
            this.setState({selectedCounty: this.props.selectedCounty});
        }
    }

    /**
     * Error handler
     *
     * @param {object | string} error
     */
    onError(error: object | string)
    {
        const methods = this.props.context.methods;
        methods.setError(error);
    }

    handleCountySelected(e: ChangeEvent<HTMLSelectElement>)
    {
        const target = e.target;
        let countyCode = target.value;
        this.setState({selectedCounty: countyCode});
        this.props.onSelected(countyCode);
    }

    render()
    {
        if (!this.state.counties) {
            return (false);
        }

        return (
            <select
                className={this.props.className}
                value={this.state.selectedCounty}
                onChange={(e)=>this.handleCountySelected(e)}>
                {this.state.counties.map((county) => {
                    return (
                        <option
                            key={county.CountyName}
                            value={county.CountyCode}
                        >
                            {county.CountyName}
                        </option>
                    );
                })}
            </select>
        )
    }
}
