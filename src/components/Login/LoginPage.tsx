import * as React from "react";
import {Component, FormEvent, KeyboardEvent, MouseEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
        Col,
        Form,
        Alert,
        Button,
        HelpBlock,
        FormGroup,
        FormControl,
        ControlLabel
} from 'react-bootstrap';
import {ToasterAlert} from "../ToasterAlert";
import {hasWhitespace} from "../../utils/validation";
import {UserType} from "../../models/UserModel";
import {ITarget} from "../../typings/HtmlInterfaces";
import {AuthenticationProvider} from "../../providers/AuthenticationProvider";
import {UserProvider} from "../../providers/UserProvider";

interface IProps {
    onSignedIn: () => void;
    context: ContextType;
}

type ValidationType = "error" | "warning" | "sucess" | null | undefined;
const initialValidPassword: ValidationType = "error";
const initialState = {
        showBadCredentials: false,
        passwordReset: false,
        validPassword: initialValidPassword,
        newPassword: '',
        password: '',
        email: ''
};
type State = Readonly<typeof initialState>;

const authenticationProvider = new AuthenticationProvider();

export const LoginPage = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <LoginPageBase
                context={context}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * LoginPage Class
 */
class LoginPageBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Lifecycle Hook - componentDidMount
     */
    public componentDidMount()
    {
        const emailText = document.getElementById('login-email') as HTMLInputElement;
        emailText.focus();
    }

    /**
     * Lifecycle hook - componentDidUpdate
     */
    public componentDidUpdate()
    {
        // Are we resetting the password?
        if (this.state.passwordReset) {
            // Is the new password unpopulated?
            if (this.state.newPassword.length === 0) {
                const newPassword = document.getElementById('new-password');
                // Sanity check - set focus to new password field
                if (newPassword) {
                    newPassword.focus();
                }
            }
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
     * Fires when user has successfully signed into the system
     *
     * @param {UserType} userInfo
     */
    private handleSignedIn(userInfo: UserType)
    {
        // Update the the current user in the state manager
        this.props.context.methods.setCurrentUser(userInfo);

        if (userInfo.MustResetPassword) {
            this.setState({passwordReset: true});
        } else {
            // Let the parent component know login is successful
            this.props.onSignedIn();
        }
    }

    /**
     * Handle when user clicks the login button
     *
     * @param {MouseEvent} e
     */
    private handleLoginClick(e: MouseEvent<Button>)
    {
        this.setState({showBadCredentials: false});

        e.preventDefault();

        const credentials =
        {
            Email: this.state.email,
            Password: this.state.password
        };

        authenticationProvider.authenticate(credentials)
        .then((response) =>
        {
            if (response.status === 200 && response.success) {
                if (response.data.MustResetPassword) {
                    this.setState({passwordReset: true});
                    this.props.context.methods.setCurrentUser(response.data);
                } else {
                    this.handleSignedIn(response.data);
                }
            } else {
                this.setState({showBadCredentials: true});
            }
        })
        .catch((error) =>
        {
            this.onError(error);
        });
    }

    /**
     * Handle changes to the email field.
     *
     * @param {FormEvent} e
     */
    private handleEmailChange(e: FormEvent<FormControl>)
    {
        const target = e.target as ITarget;
        this.setState({email: target.value});
    }

    /**
     * Handle changes to the password field.
     *
     * @param {FormEvent} e
     */
    private handlePasswordChange(e: FormEvent<FormControl>)
    {
        const target = e.target as ITarget;
        this.setState({password: target.value});
    }

    /**
     * Capture keyUp event for password field
     *
     * @param {KeyboardEvent} e
     */
    private handlePasswordKeyUp(e: KeyboardEvent<FormControl>)
    {
        // Did user press Enter while entering password?
        if (e.key === 'Enter') {
            // Simulate a click on the login button.
            const loginButton = document.getElementById('login-button') as HTMLButtonElement;
            loginButton.click();
        }
    }

    /**
     * Handle when user clicked on the Password Reset button
     *
     * @param {MouseEvent} e
     */
    private handlePasswordReset(e: MouseEvent<Button>)
    {
        e.preventDefault();

        const userProvider = new UserProvider(this.props.context.state.currentUser.AuthKey)
        userProvider.resetPassword({Id: this.props.context.state.currentUser.Id, NewPassword: this.state.newPassword})
        .then((response: any) =>
        {
            if (response.status === 200 && response.success) {
                this.setState({passwordReset: false}, () => this.handleSignedIn(response.data));
            } else {
                this.setState({showBadCredentials: true});
            }
        })
        .catch((error) =>
        {
            this.onError(error);
            this.setState({passwordReset: false});
        });
    }
    /**
     * Handle changes to the newPassword field
     *
     * @param {FormEvent} e
     */
    private handleNewPasswordChange(e: FormEvent<FormControl>)
    {
        const target = e.target as ITarget;
        this.setState({newPassword: target.value}, () =>
        {
            this.setState({validPassword: this.validPasswordState()});
        });
    }

    /**
     * Capture keyUp event on the newPassword field
     *
     * @param {KeyboardEvent} e
     */
    private handleNewPasswordKeyUp(e: KeyboardEvent<FormControl>)
    {
        // Did user presses Enter while entering new password?
        if (e.key === 'Enter') {
            // Simulate a click on the password reset button.
            const passwordResetButton = document.getElementById('password-reset-button') as HTMLButtonElement;
            passwordResetButton.click();
        }
    }

    /**
     * Return 'error' if password is invalid, null otherwise.
     *
     * @return {string | null}
     */
    private validPasswordState(): 'error' | null
    {
        if (this.state.newPassword.length < 8) {
            return 'error';
        }

        if (hasWhitespace(this.state.newPassword)) {
            return 'error';
        }
        return null;
    }

    public render()
    {
        if (!this.state.passwordReset) {
            return (
                <Form horizontal>

                    {this.state.showBadCredentials &&
                        <Alert bsStyle={"warning"}>
                            <h3>Incorrect password or User Name/Email</h3>
                        </Alert>
                    }

                    <FormGroup controlId="login-email">
                        <Col componentClass={ControlLabel} sm={2}>
                            Email or User Name
                        </Col>
                        <Col sm={3}>
                            <FormControl
                                type="text"
                                placeholder="Email or Nick Name"
                                onChange={(e) => this.handleEmailChange(e)}
                                value={this.state.email}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="login-password">
                        <Col componentClass={ControlLabel} sm={2}>
                            Password
                        </Col>
                        <Col sm={3}>
                            <FormControl
                                type="password"
                                value={this.state.password}
                                onChange={(e) => this.handlePasswordChange(e)}
                                onKeyUp={(e) => this.handlePasswordKeyUp(e)}
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}/>
                        <Button
                            id="login-button"
                            onClick={(e) => this.handleLoginClick(e)}
                            disabled={!this.state.email || !this.state.password}
                        >
                            Login
                        </Button>
                    </FormGroup>
                </Form>
            );
        } else {
            return (
                <Form horizontal>
                    <ToasterAlert
                        timeout={5000}
                        bsStyle={"warning"}
                    >
                        You must enter a new password.
                    </ToasterAlert>

                    {this.state.showBadCredentials &&
                        <Alert bsStyle={"warning"}>
                            <h3>New Password is invalid.</h3>
                        </Alert>
                    }

                    <FormGroup
                        controlId="new-password"
                        validationState={this.state.validPassword}
                    >
                        <Col componentClass={ControlLabel} sm={2}>
                            New Password
                        </Col>
                        <Col sm={3}>
                            <FormControl
                                type="password"
                                value={this.state.newPassword}
                                onChange={(e) => this.handleNewPasswordChange(e)}
                                onKeyUp={(e) => this.handleNewPasswordKeyUp(e)}
                            />
                        </Col>
                        {this.state.validPassword &&
                            <HelpBlock>New password must be at least 8 characters long and have no spaces</HelpBlock>
                        }
                    </FormGroup>

                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}/>
                        <Button
                            id="password-reset-button"
                            onClick={(e) => this.handlePasswordReset(e)}
                            disabled={this.state.validPassword === 'error'}
                        >
                            Reset Password
                        </Button>
                    </FormGroup>
                </Form>
            );
        }
    }
}
