import * as React from "react";
import {Component} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
        Panel,
        Table
} from 'react-bootstrap';
import {UpdateLanguage} from "../../utils/utilities";
import {PovertyProvider} from "../../providers/PovertyProvider";
import {IDocument} from "../../typings/HtmlInterfaces";
import {PovertyType} from "../../models/PovertyModel";

interface Props {
    povertyProvider?: PovertyProvider;
    householdSize: number;
    language: string;
    tabIndex?: number;
    context?: ContextType
}

const stringOrNull: null | string = null;
const initialState = {
    povertyGuidelinesTitle: "Federal Poverty Income Guidelines",
    language: stringOrNull
};
type State = Readonly<typeof initialState>

export const PovertyPanel = (props: Props) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <PovertyPanelBase
                context={context}
                povertyProvider={new PovertyProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * PovertyPanel Class
 */
class PovertyPanelBase extends Component<Props, State>
{
    readonly state: State = initialState;

    /**
     * Lifecycle hook - componentDidUpdate
     */
    componentDidUpdate()
    {
        const language = this.props.language;
        if (language !== this.state.language) {
            const doc = document as IDocument;
            const l10n = doc.l10n;

            // Sanity check
            if (!l10n) {
                return;
            }

            l10n.formatValue('_' + language + '-poverty-guidelines_title')
            .then((value: string) =>
            {
                this.setState({povertyGuidelinesTitle: value, language: this.props.language});
            });

            UpdateLanguage(language);
        }
    }

    /**
     * Lifecycle hook - componentDidMount
     */
    componentDidMount()
    {
        const context  = this.props.context;
        const methods = this.props.context.methods;

        if (context.state.povertyData.length === 0) {
            this.props.povertyProvider.read()
            .then((response) =>
            {
                if (response.success) {
                    methods.setPovertyData(response.data);
                } else {
                    this.onError(response);
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        }
    }

    /**
     * Error handler
     *
     * @param {object | string} error
     */
    onError(error: object | string)
    {
        this.props.context.methods.setError(error);
    }

    render()
    {
        const context = this.props.context;

        const povertyRow = (row: PovertyType) =>
        {
            let style = {};

            // If householdSize is given and it does not match the row.Id then ignore it.
            if (this.props.householdSize && this.props.householdSize === row.Id) {
                style = {backgroundColor: "lightblue"}
            }

            return (
                <tr style={style} key={'poverty-grid-row-' + row.Id} className={"poverty-grid-row"} id={'poverty-grid-row-' + row.Id}>
                    <td>{row.Id}</td>
                    <td>{row.Monthly}</td>
                </tr>
            )
        };

        return(
            <Panel bsStyle="info" tabIndex={this.props.tabIndex}>
                <Panel.Heading>
                    <Panel.Title toggle>
                        {this.state.povertyGuidelinesTitle}
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Panel.Collapse>
                        <Table striped bordered condensed hover>
                            <thead>
                            <tr>
                                <th data-l10n-id="en-household-size">Household Size</th>
                                <th data-l10n-id="en-monthly-income">Monthly Income</th>
                            </tr>
                            </thead>
                            {context && context.state.povertyData &&
                                <tbody>
                                    {context.state.povertyData.map(povertyRow, this.props.householdSize)}
                                </tbody>
                            }
                        </Table>
                    </Panel.Collapse>
                </Panel.Body>
            </Panel>
        )
    }
}