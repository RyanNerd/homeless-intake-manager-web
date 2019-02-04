import * as React from "react";
import {Component, CSSProperties, MouseEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
        Col,
        Form,
        Modal,
        Button,
        Checkbox,
        HelpBlock,
        FormGroup,
        FormControl,
        ControlLabel
} from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';
import {intakeModel, IntakeType} from "../../models/IntakeModel";
import {UpdateLanguage} from "../../utils/utilities";
import {IntakeProvider} from "../../providers/IntakeProvider";
import {StorageProvider} from "../../providers/StorageProvider";
import {MemberProvider} from "../../providers/MemberProvider";
import {StorageType} from "../../models/StorageModel";
import {INodeListOf, ITarget} from "../../typings/HtmlInterfaces";
import {FormEvent} from "react";

interface IStyle extends CSSProperties
{
    tabIndex: string;
}

interface IProps {
    context: ContextType;
    intakeProvider: IntakeProvider;
    memberProvider: MemberProvider;
    storageProvider: StorageProvider;
    intakeInfo: IntakeType;
    keyboard: boolean;
    language: string;
    onHide: (shouldHide: boolean) => void;
    show: boolean;
}

/* tslint:disable: ban-types */
type SigpadType = {
    current: {
        clear: () => void
        getTrimmedCanvas: Function
        fromDataURL: (signature: string) => void
        isEmpty: () => boolean
    }
};

const initialState = {
    signatureChanged: false,
    shouldShow: false,
    intakeInfo: intakeModel,
    language: 'en',
    canSave: false
};
type State = Readonly<typeof initialState>;

const today = new Date();
const currentYear = today.getFullYear();

export const IntakeEdit = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <IntakeEditBase
                context={context}
                intakeProvider={new IntakeProvider(context.state.currentUser.AuthKey)}
                storageProvider={new StorageProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * IntakeEdit class - Intake Edit Modal
 */
class IntakeEditBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * SignaturePad 3rd party reference
     */
    private sigPad = React.createRef() as SigpadType;

    /**
     * Lifecycle hook - getDerivedStateFromProps
     *
     * @param {Props} nextProps
     * @return {Props | null}
     */
    public static getDerivedStateFromProps(nextProps: IProps)
    {
        if (nextProps.intakeInfo && nextProps.show) {
            return {intakeInfo: nextProps.intakeInfo, shouldShow: true};
        } else {
            return {shouldShow: false};
        }
    }

    /**
     * On Error handler
     *
     * @param {object | string} error
     */
    private onError(error: object | string)
    {
        this.props.context.methods.setError(error);
    }

    /**
     * Fires when the modal has played all the animations and is displayed.
     * Similar to componentDidUpdate()
     */
    private handleOnEntered()
    {
        this.setState({intakeInfo: {...this.props.intakeInfo}, signatureChanged: false}, () =>
        {
            // If there is a signature for this intake record then we need to load it.
            if (this.props.intakeInfo.SignatureId) {
                this.props.storageProvider.read(this.props.intakeInfo.SignatureId)
                .then((response) =>
                {
                    if (response.success) {
                        this.setSignatureData(response.data.Content);
                        this.setState({canSave: this.canSave()});
                    } else {
                        this.onError(response);
                    }
                })
                .catch((error) =>
                {
                    this.onError(error);
                });
            }

            // Force a re-translation when the modal is made visible
            // tslint:disable-next-line: no-string-literal
            const l10n = document['l10n'];
            UpdateLanguage(this.props.language);
            l10n.translateDocument()
            .then(() => {
                // We are golden
            });

            this.setState({canSave: this.canSave()});

            // Work-around for React stupidity in not allowing nulls as a value on controlled elements
            if (!this.state.intakeInfo.Id) {
                const named = document.querySelectorAll('[name]') as INodeListOf;
                for (const namedElement of named) {
                    if (namedElement.value) {
                        namedElement.value = intakeModel[namedElement.name];
                    }
                }
            }
        });
    }

    /**
     * Fires when the Clear Signature button is clicked
     *
     * @param {MouseEvent} e
     */
    private clearSignature(e: MouseEvent<Button>)
    {
        e.preventDefault();

        this.sigPad.current.clear();

        this.setState({canSave: false});
    }

    /**
     * Get the signature image as a data URL
     *
     * @return {string} base64string image data
     */
    private getSignatureData(): string
    {
        return this.sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    }

    /**
     * Set the signature image from a data URL string
     *
     * @param {string} signature base64string image data
     */
    private setSignatureData(signature: string)
    {
        this.sigPad.current.fromDataURL(signature);
    }

    /**
     * Return true if the signature pad is blank
     *
     * @return {boolean}
     */
    private hasSignature(): boolean
    {
        return !this.sigPad.current.isEmpty();
    }

    /**
     * Fires when the modal is closing either from cancel or save
     *
     * @param {MouseEvent} e
     * @param {boolean} shouldSave
     */
    private handleModalDismiss(e: MouseEvent<Button>, shouldSave: boolean)
    {
        if (!shouldSave)
        {
            this.props.onHide(false);
            return;
        }

        const intakeInfo = this.state.intakeInfo;

        // Do we need to save the signature image?
        if (this.state.signatureChanged && intakeInfo) {
            const storageData =
            {
                Id: intakeInfo.SignatureId,
                Content: this.getSignatureData(),
                MimeType: 'image/png'
            } as StorageType;

            this.props.storageProvider.create(storageData)
            .then((response) =>
            {
                if (response.success) {
                    intakeInfo.SignatureId = response.data.Id;
                    this.updateIntakeRecord(intakeInfo);
                } else {
                    this.onError(response);
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        } else {
            this.updateIntakeRecord(intakeInfo);
        }
    }

    /**
     * Insert or update the given Intake record
     *
     * @param {IntakeType} intakeInfo IntakeInfo record object
     */
    private updateIntakeRecord(intakeInfo: IntakeType)
    {
        this.props.intakeProvider.create(intakeInfo)
        .then((response) =>
        {
            if (response.status === 200) {
                this.props.onHide(true);
            } else {
                this.onError(response);
            }
        })
        .catch((error) =>
        {
            this.onError(error);
        });
    }

    /**
     * Fires when a text field or checkbox is changing.
     *
     * @param {FormEvent} e
     */
    private handleOnChange(e: FormEvent<FormControl>)
    {
        const intakeInfo = this.state.intakeInfo as IntakeType;

        const target = e.target as ITarget;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        intakeInfo[name] = value;

        this.setState({intakeInfo: intakeInfo}, () =>
        {
            this.setState({canSave: this.canSave()});
        });
    }

    /**
     * Fires when the signature pad has changed.
     */
    private handleSignatureChanged()
    {
        this.setState({signatureChanged: true, canSave: this.canSave()});
    }

    //////////////
    // Validations
    //////////////

    /**
     * Given the current state of the year, month and day intake fields return 'error' if not valid or null otherwise.
     *
     * @return {string | null}
     */
    private intakeDateValid(): "success" | "warning" | "error" | null
    {
        const intakeInfo = this.state.intakeInfo;
        const intakeDay = parseInt(intakeInfo.IntakeDay.toString(), 10);
        const intakeMonth = parseInt(intakeInfo.IntakeMonth.toString(), 10);
        const intakeYear = parseInt(intakeInfo.IntakeYear.toString(), 10);

        if (!intakeYear ||
            !intakeDay  ||
            !intakeMonth) {
            return 'error';
        }

        if (intakeDay > 31 || intakeDay < 1) {
            return 'error';
        }

        if (intakeMonth > 12 || intakeMonth < 1) {
            return 'error';
        }

        if (intakeYear < 1000 || intakeYear > currentYear) {
            return 'error';
        }

        // Intake date can not be set to the future.
        const intakeDate = new Date(intakeYear + '-' + intakeMonth + '-' + intakeDay);
        const today = new Date();
        if (intakeDate > today) {
            return 'error';
        }

        return null;
    }

    /**
     * FoodBoxWeightValidation
     *
     * @return {"success" | "warning" | "error" | null}
     */
    private foodBoxWeightValid(): "success" | "warning" | "error" | null
    {
        const intakeInfo = this.state.intakeInfo;
        if (parseFloat(intakeInfo.FoodBoxWeight) < 0 || parseFloat(intakeInfo.FoodBoxWeight) > 500) {
            return 'error';
        }

        return null;
    }

    /**
     * PerishableWeightValidation
     *
     * @return {"success" | "warning" | "error" | null}
     */
    private perishableWeightValid(): "success" | "warning" | "error" | null
    {
        const intakeInfo = this.state.intakeInfo;
        if (parseFloat(intakeInfo.PerishableWeight) < 0 || parseFloat(intakeInfo.PerishableWeight) > 500) {
            return 'error';
        }

        return null;
    }

    /**
     * Returns true if all intake data fields have valid data.
     *
     * @return {boolean}
     */
    private canSave(): boolean
    {
        const intakeInfo = this.state.intakeInfo;
        // Intake date must be valid (intakeDateValid() will be null if the date is valid).
        if (!this.intakeDateValid() && !this.foodBoxWeightValid() && !this.perishableWeightValid()) {
            // There must be at least one item check marked.
            if (intakeInfo.FoodBox    ||
                intakeInfo.Perishable ||
                intakeInfo.Camper     ||
                intakeInfo.Diaper) {

                if (this.hasSignature()) {
                    return true;
                }
            }
        }

        return false;
    }

    public render()
    {
        const context = this.props.context;

        // Do we have an intake record? If not do not render.
        if (!this.state.intakeInfo) {
            return (false);
        }

        return(
            <Modal
                show={this.state.shouldShow}
                onHide={(e: MouseEvent<Button>) => this.handleModalDismiss(e, false)}
                onEntered={() => this.handleOnEntered()}
                keyboard={this.props.keyboard}
            >
                <Modal.Header>
                    <Modal.Title>Pantry Intake</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form horizontal>
                        <FormGroup controlId="intake-food-box">
                            <Col componentClass={ControlLabel} sm={1}/>
                            <Col sm={5}>
                                <Checkbox
                                    name="FoodBox"
                                    checked={this.state.intakeInfo.FoodBox}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    <span data-l10n-id="en-food-box">Food Box</span>
                                </Checkbox>
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="intake-perishables">
                            <Col componentClass={ControlLabel} sm={1}/>
                            <Col sm={5}>
                                <Checkbox
                                    name="Perishable"
                                    checked={this.state.intakeInfo.Perishable}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    <span data-l10n-id="en-perishables">Perishables</span>
                                </Checkbox>
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="intake-camper">
                            <Col componentClass={ControlLabel} sm={1}/>
                            <Col sm={5}>
                                <Checkbox
                                    name="Camper"
                                    checked={this.state.intakeInfo.Camper}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    <span data-l10n-id={"en-camper"}>Camper</span>
                                </Checkbox>
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="intake-diaper">
                            <Col componentClass={ControlLabel} sm={1}/>
                            <Col sm={5}>
                                <Checkbox
                                    name="Diaper"
                                    checked={this.state.intakeInfo.Diaper}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    <span data-l10n-id={"en-diaper"}>Diaper</span>
                                </Checkbox>
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="intake-notes">
                            <Col componentClass={ControlLabel} sm={1}/>
                            <Col sm={10}>
                                <FormControl
                                    name="Notes"
                                    type="text"
                                    data-l10n-id="en-notes"
                                    placeholder="Notes"
                                    value={this.state.intakeInfo.Notes}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="intake-signature">
                            <Col componentClass={ControlLabel} sm={1}/>
                            <Col sm={10}>
                                    <SignatureCanvas
                                        id={"my-sig"}
                                        ref={this.sigPad}
                                        backgroundColor="#234AC5"
                                        penColor="white"
                                        canvasProps={{width: 470, height: 200, className: "sig-pad"}}
                                        onEnd={() => this.handleSignatureChanged()}
                                    />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="intake-signature-button">
                            <Col componentClass={ControlLabel} sm={1}/>
                            <Col sm={2}>
                                <Button
                                    onClick={(e: MouseEvent<Button>) => this.clearSignature(e)}
                                >
                                    Clear Signature
                                </Button>
                            </Col>
                        </FormGroup>

                        {this.state.intakeInfo.Id &&
                            <FormGroup
                                controlId="intake-weight-foodbox"
                                validationState={this.foodBoxWeightValid()}
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    sm={4}
                                >
                                    <span data-l10n-id="en-food-box-weight">Food Box Weight</span>
                                </Col>
                                <Col sm={2}>
                                    <FormControl
                                        name="FoodBoxWeight"
                                        type="text"
                                        placeholder="Food Box Weight"
                                        maxLength={8}
                                        value={this.state.intakeInfo.FoodBoxWeight}
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                                {this.foodBoxWeightValid() &&
                                    <HelpBlock>
                                        Invalid Weight
                                    </HelpBlock>
                                }
                            </FormGroup>
                        }

                        {this.state.intakeInfo.Id &&
                            <FormGroup controlId="intake-weight-perishables"
                                       validationState={this.perishableWeightValid()}
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    sm={4}
                                >
                                    <span data-l10n-id="en-perishable-weight">Perishables Weight</span>
                                </Col>
                                <Col sm={2}>
                                    <FormControl
                                        name="PerishableWeight"
                                        type="text"
                                        placeholder="Perishables Weight"
                                        maxLength={8}
                                        value={this.state.intakeInfo.PerishableWeight}
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                                {this.perishableWeightValid() &&
                                    <HelpBlock>
                                        Invalid Weight
                                    </HelpBlock>
                                }
                            </FormGroup>
                        }

                        <FormGroup
                            controlId="intake-date"
                            validationState={this.intakeDateValid()}
                        >
                            <Col
                                componentClass={ControlLabel}
                                sm={4}
                            >
                                <span data-l10n-id="en-date">Date</span>
                            </Col>
                            <Col sm={2}>
                                <span data-l10n-id="en-year">Year</span>
                                <FormControl
                                    name="IntakeYear"
                                    type="text"
                                    data-l10n-id="en-year"
                                    placeholder="Year"
                                    maxLength={4}
                                    value={this.state.intakeInfo.IntakeYear}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </Col>
                            <Col sm={2}>
                                <span data-l10n-id="en-month">Month</span>
                                <FormControl
                                    name="IntakeMonth"
                                    type="text"
                                    data-l10n-id="en-month"
                                    placeholder="Month"
                                    maxLength={2}
                                    value={this.state.intakeInfo.IntakeMonth}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </Col>
                            <Col sm={2}>
                                <span data-l10n-id="en-day">Day</span>
                                <FormControl
                                    name="IntakeDay"
                                    type="text"
                                    data-l10n-id="en-day"
                                    placeholder="Day"
                                    maxLength={2}
                                    value={this.state.intakeInfo.IntakeDay}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </Col>
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        disabled={!context.state.currentUser.IsAdmin || !this.state.intakeInfo.Id}
                        style={{position: "absolute", left: "15px", tabIndex: "-1"} as IStyle}
                        bsStyle="danger"
                        onClick={() =>
                        {
                            alert('Delete under construction');
                        }}
                    >
                        Delete
                    </Button>

                    <Button
                        onClick={(e: MouseEvent<Button>) => this.handleModalDismiss(e, false)}
                    >
                        <span data-l10n-id="en-cancel">Cancel</span>
                    </Button>
                    <Button
                        disabled={!this.state.canSave}
                        onClick={(e: MouseEvent<Button>) => this.handleModalDismiss(e, true)}
                        bsStyle="primary"
                    >
                        <span data-l10n-id="en-save-changes">Save changes</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
