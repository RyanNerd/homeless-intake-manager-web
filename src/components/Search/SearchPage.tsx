import * as React from "react";
import {Component, FormEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
    Col,
    Form,
    Alert,
    Button,
    FormGroup,
    HelpBlock,
    FormControl,
    ControlLabel
} from 'react-bootstrap';
import {
    isNameValid,
    isDigitsOnly
} from "../../utils/validation";
import {MemberGrid} from '../Member/MemberGrid';
import {MemberEdit} from "../Member/MemeberEdit";
import {MemberType} from "../../models/MemberModel";
import {MemberPanel} from '../Member/MemberPanel';
import {getRecordById} from "../../utils/utilities";
import {MemberProvider} from "../../providers/MemberProvider";
import {HouseholdProvider} from "../../providers/HouseholdProvider";
import {MouseEvent} from "react";
import {ITarget} from "../../typings/HtmlInterfaces";

const BADGE_LENGTH_MAX = 6;

interface IProps {
    householdProvider?: HouseholdProvider;
    memberProvider?: MemberProvider;
    context?: ContextType;
}

const initialMembers: MemberType[] = [];
const initialState = {
    nameInputHasFocus: false,
    badgeInputHasFocus: false,
    showInvalidBadgeAlert: false,
    disableNameInput: false,
    disableBadgeInput: false,
    showMemberEdit: false,
    nameInput: "",
    badgeInput: "",
    members: initialMembers
};
type State = Readonly<typeof initialState>;

export const SearchPage = (props: IProps) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <SearchPageBase
                context={context}
                memberProvider={new MemberProvider(context.state.currentUser.AuthKey)}
                householdProvider={new HouseholdProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * SearchPage Class
 *
 * FIXME: Something is funky with search by name (should fire off after 2 characters and it's taking three).
 * TODO: Filter out inactive members from search
 * TODO: Search option for existing households
 */
class SearchPageBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Default initial state
     *
     * @returns {State} state object initial hash key and values
     */
    private defaultState(): State
    {
        // Set the Store currentMember and currentHousehold back to default.
        const methods = this.props.context.methods;
        methods.resetSearch();

        return initialState;
    }

    /**
     * Lifecycle hook - componentDidMount
     */
    public componentDidMount() {
        this.resetSearch();
    }

    /**
     * Error Handler
     *
     * @param {object | string} error
     */
    private onError(error: object | string)
    {
        const context = this.props.context;
        this.setState(this.defaultState(), () => {
            context.methods.setError(error);
        });
    }

    /**
     * Sets state back to default also clears the search text boxes' values
     * as well as letting the LandingPage know that the state has changed.
     */
    private resetSearch()
    {
        this.setState(this.defaultState(), () =>
        {
            const txtBadgeElement = document.getElementById('formBadge');
            if (txtBadgeElement) {
                txtBadgeElement.focus();
            }
        });
    }

    /**
     * Handle when the value changes for the badge text input element
     *
     * @param {MouseEvent} e
     */
    private handleBadgeChange(e: MouseEvent<Button>)
    {
        e.preventDefault();
        const target = e.target as ITarget;
        const badgeInput = target.value;

        this.setState({
            disableNameInput: (badgeInput.length > 0),
            disableBadgeInput: (badgeInput.length > BADGE_LENGTH_MAX),
            badgeInput: badgeInput
        });

        // We only kick off a search if the entered badge # is entered in full
        if (badgeInput.length === BADGE_LENGTH_MAX) {
            // Parse the entered badge value into an int.
            const id = parseInt(badgeInput, 10);

            // If the badge number parses to 0 then show the invalid badge alert and bail.
            if (id === 0) {
                this.setState({...this.defaultState(), showInvalidBadgeAlert: true});
                return;
            }

            // Get the matching member from the web service.
            this.props.memberProvider.read(id)
            .then((response) =>
            {
                // Did we find the member?
                if (response.success) {
                    this.setState({members: response.data});
                } else {
                    this.setState({...this.defaultState(), showInvalidBadgeAlert: true});
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        } else {
            this.setState({members: initialMembers});
        }
    }

    /**
     * Handle when the value changes for the name text input element
     *
     * @param {FormEvent} e
     */
    private handleNameChange(e: FormEvent<FormControl>)
    {
        const target = e.target as ITarget;
        const nameInput = target.value;

        this.setState({disableBadgeInput: (nameInput.length > 0), nameInput: nameInput});

        // We only kick off a search if the entered last name is 2 or more characters.
        if (nameInput.length > 1) {
            // Perform the search based on the entered last name using a Soft Search
            this.props.memberProvider.read(nameInput, 'last_name', true)
            .then((response) =>
            {
                // Did we find any member(s)?
                if (response.status === 200)
                {
                    // Set the members array so that the member grid will update.
                    this.setState({members: response.data});
                } else {
                    e.preventDefault();
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        }
    }

    /**
     * Fires when a member is selected from the MemberGrid
     *
     * @param {int} memberId
     */
    private onMemberSelected(memberId: number)
    {
        const methods = this.props.context.methods;
        const memberInfo = getRecordById(parseInt(memberId, 10), this.state.members) as MemberType;

        methods.setCurrentMember(memberInfo);

        //
        // UPDATE CURRENT HOUSEHOLD
        //
        this.props.householdProvider.read(memberInfo.HouseholdId)
        .then((response) =>
        {
            if (response.success) {
                methods.setCurrentHousehold(response.data);
            } else {
                this.onError(response);
            }
        })
        .catch((error) =>
        {
            this.onError(error);
        });

        //
        // UPDATE MEMBER COUNT (Storage context householdSize)
        //
        this.props.householdProvider.memberCount(memberInfo.HouseholdId)
        .then((response) =>
        {
            if (typeof response === "number") {
                methods.setHouseholdSize(response);
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
     * Fires when the Edit Member button is clicked and displays the MemberEdit modal.
     *
     * @param {MouseEvent} e
     */
    private handleMemberEdit(e: MouseEvent<Button>)
    {
        e.preventDefault();
        this.setState({showMemberEdit: true});
    }

    /**
     * Fires when the MemberEdit modal closes (either by a save or cancel)
     *
     * @param {MemberType} memberInfo
     */
    private handleMemberEditClose(memberInfo: MemberType)
    {
        // Close the Member Edit modal
        this.setState({showMemberEdit: false});

        // The memberInfo with be truthy if changes have been made to the currentMember.
        if (memberInfo) {
            this.props.context.methods.setCurrentMember(memberInfo);
        }
    }

    /**
     * Validate that only alpha and dashes are allowed for searching last name.
     *
     * @return {string | null} Null if valid characters, otherwise 'error' is returned.
     */
    private getLastNameValidation(): "success" | "warning" | "error" | null
    {
        if (!isNameValid(this.state.nameInput)) {
            return 'error';
        }
        return null;
    }

    /**
     * Validate search by member # is digits only
     *
     * @return {null | string} Return null if valid, otherwise 'error'
     */
    private getMemberNumberValidation(): "success" | "warning" | "error" | null
    {
        if (!isDigitsOnly(this.state.badgeInput)) {
            return 'error';
        }
        return null;
    }

    public render()
    {
        const invalidBadgeAlert = (
            <Alert
                bsStyle="danger"
                onDismiss={() => this.resetSearch()}>
                Invalid Member #
            </Alert>
        );

        const context = this.props.context;

        return (
            <Form horizontal>
                {context.state.currentMember === null &&
                <div>
                    <FormGroup
                        controlId="formBadge"
                        validationState={this.getMemberNumberValidation()}
                    >
                        <Col componentClass={ControlLabel} sm={2}>
                            Search by Member #
                        </Col>
                        <Col sm={1}>
                            <FormControl
                                type="text"
                                placeholder="Member #"
                                value={this.state.badgeInput}
                                onChange={(e: MouseEvent<Button>) => this.handleBadgeChange(e)}
                                onFocus={() => this.setState({badgeInputHasFocus: true})}
                                onBlur={() => this.setState({badgeInputHasFocus: false})}
                                disabled={this.state.disableBadgeInput}
                                maxLength={BADGE_LENGTH_MAX}
                            />
                            {this.state.showInvalidBadgeAlert && invalidBadgeAlert}
                        </Col>
                        {this.state.badgeInputHasFocus &&
                            <HelpBlock>Only Digits are allowed for badge number searches</HelpBlock>
                        }
                    </FormGroup>

                    <FormGroup
                        controlId="formLastName"
                        validationState={this.getLastNameValidation()}
                    >
                        <Col componentClass={ControlLabel} sm={2}>
                            Search by Last Name
                        </Col>
                        <Col sm={2}>
                            <FormControl
                                type="text"
                                placeholder="Last Name"
                                onChange={(e) => this.handleNameChange(e)}
                                onFocus={() => this.setState({nameInputHasFocus: true})}
                                onBlur={() => this.setState({nameInputHasFocus: false})}
                                value={this.state.nameInput}
                                disabled={this.state.disableNameInput}
                                maxLength={50}
                            />
                        </Col>
                        {this.state.nameInputHasFocus &&
                            <HelpBlock>Only Alpha characters or dashes allowed for Last Name searches</HelpBlock>
                        }
                    </FormGroup>

                    <FormGroup controlId="formResetSearch">
                        <Col componentClass={ControlLabel} sm={3}>
                            <Button
                                onClick={() => this.resetSearch()}
                            >
                                Reset Search
                            </Button>
                            <span style={{paddingRight: "10px"}}/>
                        </Col>
                    </FormGroup>

                    {this.state.members && this.state.members.length > 0 &&
                    <MemberGrid
                        members={this.state.members}
                        onMemberSelected={(memberId: number) => this.onMemberSelected(memberId)}
                    />
                    }
                </div>
                }

                {context.state.currentMember &&
                    <div style={{paddingRight: "70%"}}>
                        <MemberPanel
                            readOnly={true}
                        >
                            <hr/>
                            <div style={{marginBottom: "5px", marginLeft: "5px"}}>
                                <Button onClick={(e) => this.handleMemberEdit(e)} bsStyle="info">Edit Member</Button>
                                <span> </span>
                                <span style={{paddingRight: "15px"}}> </span>
                                <Button onClick={() => this.resetSearch()}>Reset Search</Button>
                            </div>
                        </MemberPanel>
                    </div>
                }

                {/* MemberEdit Modal */}
                <MemberEdit
                    show={this.state.showMemberEdit}
                    onHide={(memberInfo: MemberType) => this.handleMemberEditClose(memberInfo)}
                    keyboard={true}
                    memberInfo={context.state.currentMember}
                />
            </Form>
        );
    }
}
