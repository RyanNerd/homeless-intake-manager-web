import * as React from "react";
import {ChangeEvent, Component} from "react";
import {statesModel} from "../models/StatesModel";

interface IProps {
    selectedState: string;
    onSelected: (stateCode: string) => void;
    className: string;
}

const initialState = {
    selectedState: ''
};
type State = Readonly<typeof initialState>;

/**
 * StateDropdown Class
 */
export class StateDropdown extends Component<IProps, State>
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
        if (nextProps.selectedState !== prevState.selectedState) {
            return {selectedState: nextProps.selectedState};
        }

        return null;
    }

    /**
     * Handle when a state is selected
     *
     * @param {ChangeEvent} e
     */
    private handleStateSelected(e: ChangeEvent<HTMLSelectElement>)
    {
        const target = e.target;
        const stateCode = target.value;
        this.setState({selectedState: stateCode});
        this.props.onSelected(stateCode);
    }

    public render()
    {
        return (
            <select
                className={this.props.className}
                value={this.state.selectedState}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => this.handleStateSelected(e)}
            >
                {statesModel.map((stateRecord) => {
                    return (
                        <option
                            key={stateRecord.name}
                            value={stateRecord.abbreviation}
                        >
                            {stateRecord.name}
                        </option>
                    );
                })}
            </select>
        );
    }
}
