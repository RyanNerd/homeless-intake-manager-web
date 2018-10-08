import * as React from "react";
import { Component } from "react";
import {StoreConsumer} from "../StoreContext";
import {PovertyGrid} from "./PovertyGrid";
import {PovertyEdit} from "./PovertyEdit";
import {PovertyProvider} from "../../providers/PovertyProvider";
import { ContextType } from "../StoreContext";
import {PovertyType} from "../../models/PovertyModel";

interface Props {
    context: ContextType
    povertyProvider: PovertyProvider;
}

const povertyInfoOrNull: PovertyType | null = null;
const initialState = {
    showPovertyEdit: false,
    povertyInfo: povertyInfoOrNull
};
type State = Readonly<typeof initialState>;

export const PovertyPage = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <PovertyPageBase
                context={context}
                povertyProvider={new PovertyProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * PovertyPage Class
 */
class PovertyPageBase extends Component<Props, State>
{
    readonly state: State = initialState;

    /**
     * Lifecycle hook - componentDidMount
     */
    componentDidMount()
    {
        this.populatePovertyGrid(false);
    }

    /**
     * Error handler
     *
     * @param {object | string} error
     */
    onError(error: object|string)
    {
        this.props.context.methods.setError(error);
    }

    /**
     * Fires when a poverty record is selected.
     * Bring up PovertyEdit modal.
     *
     * @param {object} poverty
     */
    protected onPovertySelected(poverty: PovertyType)
    {

        let povertyInfo = {...poverty};
        this.setState({povertyInfo: povertyInfo, showPovertyEdit: true});
    }

    /**
     * Called when the PovertyGrid needs a refresh.
     *
     * @param {boolean} shouldRefresh
     */
    protected populatePovertyGrid(shouldRefresh: boolean)
    {
        const context: ContextType = this.props.context;
        const methods = context.methods;

        // Were changes made, or is the povertyData array empty?
        if (shouldRefresh || context.state.povertyData.length === 0) {
            this.props.povertyProvider.read()
            .then((response)=>
            {
                if (response.success) {
                    methods.setPovertyData(response.data);
                } else {
                    this.onError(response);
                }
            })
            .catch((error)=>
            {
                this.onError(error);
            });
        }
    }

    /**
     * Fires when the PovertyEdit modal closes (either by a save or cancel)
     *
     * @param {boolean} shouldRefresh True if changes were made in the modal and the grid should refresh
     */
    protected handlePovertyEditClose(shouldRefresh: boolean)
    {
        this.setState({showPovertyEdit: false});

        if (shouldRefresh) {
            this.populatePovertyGrid(true);
        }
    }

    render()
    {
        const context: ContextType = this.props.context;

        return(
            <div style={{marginTop: "25px", marginLeft: "15px", marginBottom: "25px", marginRight: "15px"}}>

                {context.state.povertyData &&
                    <PovertyGrid
                        povertyData={context.state.povertyData}
                        onPovertySelected={(poverty: PovertyType)=>this.onPovertySelected(poverty)}
                    />
                }

                {/* PovertyEdit Modal */}
                <PovertyEdit
                    show={this.state.showPovertyEdit}
                    onHide={(shouldRefresh: boolean)=>this.handlePovertyEditClose(shouldRefresh)}
                    keyboard={true}
                    povertyInfo={this.state.povertyInfo}
                />
            </div>
        )
    }
}