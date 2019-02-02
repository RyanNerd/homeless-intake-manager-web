import * as React from "react";
import {Component, FormEvent, MouseEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
    Col,
    Row,
    Form,
    Modal,
    Button,
    Checkbox,
    HelpBlock,
    FormGroup,
    FormControl,
    ControlLabel
} from 'react-bootstrap';
import {
        isNameValid,
        isEmailValid,
        hasWhitespace,
        isNickNameValid
} from "../../utils/validation";
import {UserProvider} from "../../providers/UserProvider";
import {UserType} from "../../models/UserModel";
import {ITarget} from "../../typings/HtmlInterfaces";

interface IProps {
    userInfo: UserType;
    userProvider: UserProvider;
    keyboard: boolean;
    context?: ContextType;
    onHide: (shouldHide: boolean) => void;
    show: boolean;
}

type ValidationType = "error" | "warning" | "success" | null;
const validationOrNull: ValidationType = null;
const userInfoOrNull: UserType | null = null;
const initialState = {
    validFirstName: validationOrNull,
    validLastName: validationOrNull,
    validPassword: validationOrNull,
    validUserName: validationOrNull,
    validEmail: validationOrNull,
    shouldShow: false,
    userInfo: userInfoOrNull,
    canSave: false
};
type State = Readonly<typeof initialState>;

export const UserEdit = (props: IProps) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <UserEditBase
                context={context}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * UserEdit Class
 *
 * TODO: Check for UserName (nick name) dupes as they are typed? - Requires modification to pantry-app
 */
class UserEditBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Lifecycle hook - getDerivedStateFromProps
     *
     * @param {Props} nextProps
     * @return {State | null}
     */
    public static getDerivedStateFromProps(nextProps: IProps)
    {
        if (nextProps.show && nextProps.userInfo) {
            return {userInfo: nextProps.userInfo, shouldShow: true};
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
            const userInfo = this.state.userInfo;

            this.props.userProvider.create(userInfo)
            .then((response) =>
            {
                if (response.success) {
                    const context = this.props.context;

                    // If the user changed is the current authenticated user then log out.
                    if (userInfo.Id === context.state.currentUser.Id) {
                        alert('Current logged in user account has changed. You will need to log in again.');
                        window.location.reload();
                        return;
                    }
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
        const userInfo = this.state.userInfo;

        const target = e.target as ITarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        userInfo[name] = value;
        this.setState({userInfo: userInfo}, () => {this.checkValidations(); });
    }

    /**
     * Examine all field validations and set the valid____ state variables accordingly.
     */
    private checkValidations()
    {
        this.setState(
        {
            validFirstName: this.validFirstNameState(),
            validLastName: this.validLastNameState(),
            validPassword: this.validPasswordState(),
            validUserName: this.validNickNameState(),
            validEmail: this.validEmailState()
        }, () => {
            this.setState({
                canSave: this.canSave()
            });
        });
    }

    /**
     * Sets the canSave state variable based on all field validations being good.
     *
     * @return {boolean} Return true if all validations pass, false otherwise.
     */
    private canSave(): boolean
    {
        if (this.state.userInfo) {
            let canSave = (
                (this.state.userInfo.Email !== null &&
                 this.state.userInfo.Email.length !== 0) ||
                (this.state.userInfo.UserName !== null && this.state.userInfo.UserName.length !== 0)
            );

            canSave = canSave &&
                this.state.validFirstName === null &&
                this.state.validLastName === null &&
                this.state.validPassword === null &&
                this.state.validUserName === null &&
                this.state.validEmail === null;

            // Existing User?
            if (this.state.userInfo.Id) {
                return canSave;
            } else {
                // New users must have a password
                return canSave &&
                       this.state.userInfo.Password &&
                       this.state.userInfo.Password.length >= 8;
            }
        }

        return false;
    }

    ////////////////
    // Validations
    ////////////////

    /**
     * Validate FirstName field
     *
     * @return {string | null} Returns 'error' if the first name is not valid, null otherwise.
     */
    private validFirstNameState(): ValidationType
    {
        if (this.state.userInfo && this.state.userInfo.FirstName) {
            if (!isNameValid(this.state.userInfo.FirstName)) {
                return 'error';
            }
        }
        return null;
    }

    /**
     * Validate LastName field
     *
     * @return {string | null} Returns 'error' if the last name is not valid, null otherwise.
     */
    private validLastNameState(): ValidationType
    {
        if (this.state.userInfo && this.state.userInfo.LastName) {
            if (!isNameValid(this.state.userInfo.LastName)) {
                return 'error';
            }
        }
        return null;
    }

    /**
     * Validate Email field
     *
     * @return {string | null} Returns 'error' if the email is not valid, null otherwise.
     */
    private validEmailState(): ValidationType
    {
        if (this.state.userInfo && this.state.userInfo.Email) {
            if (!isEmailValid(this.state.userInfo.Email)) {
                return 'error';
            }
        }
        return null;
    }

    /**
     * Validate Password field
     *
     * @return {string | null} Returns 'error' if the password is not valid, null otherwise.
     */
    private validPasswordState(): ValidationType
    {
        const userInfo = this.state.userInfo;
        if (userInfo && userInfo.Password !== null) {
            if (userInfo.Password.length < 8) {
                return 'error';
            }

            if (hasWhitespace(userInfo.Password)) {
                return 'error';
            }
        }

        if (this.state.userInfo.Id === null && hasWhitespace(userInfo.Password)) {
            return 'warning';
        }
        return null;
    }

    /**
     * Validate UserName field
     *
     * @return {string | null} Returns 'error' if the nickname (UserName) is not valid, null otherwise.
     */
    private validNickNameState(): ValidationType
    {
        if (this.state.userInfo && this.state.userInfo.UserName !== null) {
            if (!isNickNameValid(this.state.userInfo.UserName)) {
                return 'error';
            }
        }
        return null;
    }

    public render()
    {
        return(
            <Modal
                bsSize="lg"
                show={this.state.shouldShow}
                onHide={(e: MouseEvent<Button>) => this.handleModalDismiss(e, false)}
                keyboard={this.props.keyboard}
            >
                <Modal.Header closeButton>
                    <Modal.Title>User Maintenance</Modal.Title>
                </Modal.Header>

                {this.state.userInfo &&
                <Modal.Body>
                    <Form horizontal>
                        <Row>
                            <FormGroup
                                controlId="user-first-name"
                                validationState={this.state.validFirstName}
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    md={2}
                                >
                                    First Name
                                </Col>
                                <Col md={3}>
                                    <FormControl
                                        type="text"
                                        placeholder="First Name"
                                        maxLength={45}
                                        value={this.state.userInfo.FirstName}
                                        name="FirstName"
                                        onChange={(e) => this.handleOnChange(e)}
                                        disabled={this.state.userInfo && this.state.userInfo.UserName === 'admin'}
                                    />
                                </Col>
                                {this.state.validFirstName &&
                                    <HelpBlock>
                                        Only alpha and dash characters allowed
                                    </HelpBlock>
                                }
                            </FormGroup>

                            <FormGroup
                                controlId="user-last-name"
                                validationState={this.state.validLastName}
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    md={2}
                                >
                                    Last Name
                                </Col>
                                <Col md={3}>
                                    <FormControl
                                        type="text"
                                        placeholder="Last Name"
                                        maxLength={45}
                                        value={this.state.userInfo.LastName}
                                        name="LastName"
                                        onChange={(e) => this.handleOnChange(e)}
                                        disabled={this.state.userInfo && this.state.userInfo.UserName === 'admin'}
                                    />
                                </Col>
                                {this.state.validLastName &&
                                    <HelpBlock>
                                        Only alpha and dash characters allowed
                                    </HelpBlock>
                                }
                            </FormGroup>

                            <FormGroup
                                controlId="user-email"
                                validationState={this.state.validEmail}
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    md={2}
                                >
                                    Email
                                </Col>
                                <Col md={3}>
                                    <FormControl
                                        name="Email"
                                        type="text"
                                        placeholder="user@email.com"
                                        maxLength={150}
                                        value={this.state.userInfo.Email}
                                        onChange={(e) => this.handleOnChange(e)}
                                        disabled={this.state.userInfo && this.state.userInfo.UserName === 'admin'}
                                    />
                                </Col>
                                {this.state.validEmail && <HelpBlock>Invalid email address</HelpBlock>}
                            </FormGroup>

                            <FormGroup
                                controlId="user-nick-name"
                                validationState={this.state.validUserName}
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    md={2}
                                >
                                    Nick Name
                                </Col>
                                <Col md={3}>
                                    <FormControl
                                        style={{textTransform: "lowercase"}}
                                        disabled={this.state.userInfo && this.state.userInfo.UserName === 'admin'}
                                        name="UserName"
                                        type="text"
                                        placeholder="masked-marauder"
                                        maxLength={45}
                                        value={this.state.userInfo.UserName}
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                                {this.state.validUserName &&
                                    <HelpBlock>
                                        Only alpha, digit or dash characters are allowed
                                    </HelpBlock>
                                }
                            </FormGroup>

                            <FormGroup
                                controlId="user-password"
                                validationState={this.state.validPassword}
                            >
                                <Col
                                    componentClass={ControlLabel}
                                    md={2}
                                >
                                    Password
                                </Col>
                                <Col md={3}>
                                    <FormControl
                                        name="Password"
                                        type="password"
                                        maxLength={50}
                                        value={this.state.userInfo.Password}
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                                {this.state.validPassword &&
                                    <HelpBlock>
                                        Must be at least 8 characters and have no spaces
                                    </HelpBlock>
                                }
                            </FormGroup>

                            <Col
                                componentClass={ControlLabel}
                                md={2}
                            >
                                Reset
                            </Col>
                            <Checkbox
                                checked={this.state.userInfo.MustResetPassword}
                                name="MustResetPassword"
                                onChange={(e) => this.handleOnChange(e)}
                                disabled={this.state.userInfo && this.state.userInfo.UserName === 'admin'}
                            >
                                User must reset password on next login
                            </Checkbox>

                            <Col
                                componentClass={ControlLabel}
                                md={2}
                            >
                                Security Level
                            </Col>
                            <Checkbox
                                checked={this.state.userInfo.IsAdmin}
                                name="IsAdmin"
                                onChange={(e) => this.handleOnChange(e)}
                                disabled={this.state.userInfo && this.state.userInfo.UserName === 'admin'}
                            >
                                User is an Administrator
                            </Checkbox>

                            <Col
                                componentClass={ControlLabel}
                                md={2}
                            >
                                Status
                            </Col>
                            <Checkbox
                                checked={this.state.userInfo.Active}
                                name="Active"
                                onChange={(e) => this.handleOnChange(e)}
                                disabled={this.state.userInfo && this.state.userInfo.UserName === 'admin'}
                            >
                                User is Active
                            </Checkbox>
                        </Row>
                    </Form>
                </Modal.Body>
                }

                <Modal.Footer>
                    <Button
                        onClick={(e) => this.handleModalDismiss(e, false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={(e) => this.handleModalDismiss(e, true)}
                        bsStyle="primary"
                        disabled={!this.state.canSave}
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
