import * as React from "react";
import {Component, MouseEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
    Col,
    Row,
    Form,
    Modal,
    Button,
    FormGroup,
    FormControl,
    ControlLabel,
} from 'react-bootstrap';
import {isDigitsOnly} from "../../utils/validation";
import {PovertyProvider} from "../../providers/PovertyProvider";
import {PovertyType} from "../../models/PovertyModel";
import {FormEvent} from "react";
import {ITarget} from "../../typings/HtmlInterfaces";

interface IProps {
    povertyProvider: PovertyProvider;
    povertyInfo: PovertyType;
    keyboard: boolean;
    context: ContextType;
    onHide: (shouldHide: boolean) => void;
    show: boolean;
}

const initialValidMonthlyAmount: null | 'error' = null;
const initialPovertyInfo: null | PovertyType = null;
const initialState = {
    validMonthlyAmount: initialValidMonthlyAmount,
    povertyInfo: initialPovertyInfo,
    shouldShow: false
};
type State = Readonly<typeof initialState>;

export const PovertyEdit = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <PovertyEditBase
                context={context}
                povertyProvider={new PovertyProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * PovertyEdit Class
 */
class PovertyEditBase extends Component<IProps, State>
{

    public readonly state: State = initialState;

    /**
     * Lifecycle hook - getDerivedStateFromProps
     *
     * @param {object} nextProps
     * @return {object || null}
     */
    public static getDerivedStateFromProps(nextProps: IProps)
    {
        if (nextProps.show) {
            return {povertyInfo: nextProps.povertyInfo, shouldShow: true};
        } else {
            return {shouldShow: false};
        }
    }

    /**
     * Error handler
     *
     * @param {object | string} error
     */
    private onError(error: object | string)
    {
        this.props.context.methods.setError(error);
    }

    /**
     * Fires when the modal is closing either from cancel or save)
     *
     * @param {MouseEvent} e
     * @param {boolean} shouldSave
     */
    private handleModalDismiss(e: MouseEvent<Button>, shouldSave: boolean)
    {
        // Was the save button clicked to dismiss?
        if (shouldSave) {
            this.props.povertyProvider.update(this.state.povertyInfo)
            .then((response) =>
            {
                if (response.success) {
                    this.props.onHide(true);
                } else {
                    this.onError(response);
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        } else {
            this.props.onHide(false);
        }
    }

    /**
     * Fires when a text field or checkbox is changing.
     *
     * @param {FormEvent} e
     */
    private handleOnChange(e: FormEvent<FormControl>)
    {
        const povertyInfo = this.state.povertyInfo as PovertyType;

        const target = e.target as ITarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        povertyInfo[name] = value;
        this.setState({
            povertyInfo: povertyInfo,
            validMonthlyAmount: isDigitsOnly(povertyInfo.Monthly.toString()) ? null : 'error'
        });
    }

    public render()
    {
        const povertyInfo = this.state.povertyInfo;

        // Do we have a poverty record? If not then do not render.
        if (!povertyInfo) {
            return (false);
        }

        return(
            <Modal
                bsSize="sm"
                show={this.state.shouldShow}
                onHide={(e: MouseEvent<Button>) => this.handleModalDismiss(e, false)}
                keyboard={this.props.keyboard}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Poverty Income Guideline Maintenance</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form horizontal>
                        <Row>
                            <FormGroup
                                controlId="poverty-household-size"
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    sm={6}
                                >
                                    Household Size
                                </Col>
                                <Col sm={3}>
                                    <FormControl
                                        type="text"
                                        value={povertyInfo.Id}
                                        name="Id"
                                        disabled={true}
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup
                                controlId="poverty-monthly"
                                validationState={this.state.validMonthlyAmount}
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    sm={6}
                                >
                                    Monthly
                                </Col>
                                <Col sm={4}>
                                    <FormControl
                                        type="text"
                                        maxLength={6}
                                        value={povertyInfo.Monthly}
                                        name="Monthly"
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                            </FormGroup>
                        </Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        onClick={(e: MouseEvent<Button>) => this.handleModalDismiss(e, false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={this.state.validMonthlyAmount === 'error' || !povertyInfo.Monthly}
                        onClick={(e) => this.handleModalDismiss(e, true)}
                        bsStyle="primary"
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
