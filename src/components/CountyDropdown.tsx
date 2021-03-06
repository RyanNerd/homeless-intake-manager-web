import * as React from "react";
import {Component} from "react";
import {ContextType, StoreConsumer} from "./StoreContext";
import {CountyProvider} from "../providers/CountyProvider";
import {CountyType} from "../models/CountyModel";
import {ChangeEvent} from "react";

interface IProps {
    selectedCounty: string;
    countyProvider?: CountyProvider;
    className: string;
    stateCode: string;
    onSelected: (selected: string) => void;
    context?: ContextType;
}

const stringOrNull: string | null = null;
const initialCounties: CountyType[] | null = null;
const initialState = {
    selectedCounty: stringOrNull,
    stateCode: stringOrNull,
    counties: initialCounties
};
type State = Readonly<typeof initialState>;

export const CountyDropdown = (props: IProps) => (
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
class CountyDropdownBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Lifecycle hook - getDerivedStateFromProps
     *
     * @param {IProps} nextProps
     * @param {State} prevState
     * @return {State | null}
     */
    public static getDerivedStateFromProps(nextProps: IProps, prevState: State): State | null
    {
        if (nextProps.stateCode !== prevState.stateCode) {
            return {stateCode: nextProps.stateCode, counties: null, selectedCounty: null};
        }

        return null;
    }

    /**
     * Lifecycle hook - componentDidUpdate
     *
     * @param {IProps} prevProps
     * @param {State} prevState
     */
    public componentDidUpdate(prevProps: IProps, prevState: State)
    {
        if (this.props.stateCode && this.state.counties === null) {
            this.props.countyProvider.read(this.props.stateCode)
            .then((response) =>
            {
                if (response.success) {
                    this.setState({counties: response.data, stateCode: this.props.stateCode});
                } else {
                    this.onError(response);
                }
            })
            .catch((error) =>
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
    private onError(error: object | string)
    {
        const methods = this.props.context.methods;
        methods.setError(error);
    }

    /**
     * Fires when the user selects a county
     * @param {ChangeEvent} e
     */
    private handleCountySelected(e: ChangeEvent<HTMLSelectElement>)
    {
        const target = e.target;
        const countyCode = target.value;
        this.setState({selectedCounty: countyCode});
        this.props.onSelected(countyCode);
    }

    public render()
    {
        if (!this.state.counties) {
            return (false);
        }

        return (
            <select
                className={this.props.className}
                value={this.state.selectedCounty}
                onChange={(e) => this.handleCountySelected(e)}>
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
        );
    }
}
