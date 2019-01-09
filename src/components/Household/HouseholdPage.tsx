import * as React from "react";
import {Component, FormEvent, MouseEvent} from "react";
import { ContextType} from "../StoreContext";
import {StoreConsumer} from "../StoreContext";
import {
    Button,
    Col,
    ControlLabel,
    Checkbox,
    Form,
    FormGroup,
    FormControl,
    HelpBlock
} from "react-bootstrap";
import {MemberEdit} from "../Member/MemeberEdit";
import {MemberGrid} from "../Member/MemberGrid";
import {memberModel, MemberType} from "../../models/MemberModel";
import {MemberPanel} from "../Member/MemberPanel";
import {PovertyPanel} from "../Poverty/PovertyPanel";
import {ToasterAlert} from "../ToasterAlert";
import {getRecordById} from "../../utils/utilities";
import {StateDropdown} from "../StateDropdown";
import {CountyDropdown} from "../CountyDropdown";
import {MemberProvider} from "../../providers/MemberProvider";
import {HouseholdProvider} from "../../providers/HouseholdProvider";
import NewWindow from 'react-new-window';
import {MemberBadge} from "../Member/MemberBadge";
import {INodeListOf, ITarget} from "../../typings/HtmlInterfaces";

interface IProps {
    context: ContextType;
    householdProvider: HouseholdProvider;
    memberProvider: MemberProvider;
}

const memberInfoOrNull: MemberType | null = null;
const memberArray: MemberType[] = [];
const initialState =
{
    selectedMemberInfo: memberInfoOrNull,
    showMemberEdit: false,
    householdId: numberOrNull,
    members: memberArray,
    showMemberBadge: false,
    householdNameHasFocus: false,
    showSaved: false,
    autoSave: false
};
type State = Readonly<typeof initialState>;

export const HouseholdPage = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <HouseholdPageBase
                context={context}
                householdProvider={new HouseholdProvider(context.state.currentUser.AuthKey)}
                memberProvider={new MemberProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * HouseholdPage class - Household Edit Page
 */
class HouseholdPageBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Lifecycle Hook - componentDidMount
     */
    public componentDidMount()
    {
        // Subscribe to store.context.currentHousehold state changes forcing save if IsDemo is updated
        this.householdUpdated = this.householdUpdated.bind(this);
        this.props.context.subscribe('currentHousehold', this.householdUpdated);
    }

    /**
     * Lifecycle hook - componentDidUpadte
     *
     * @param {IProps} prevProps
     */
    public componentDidUpdate(prevProps: IProps)
    {
        const context = this.props.context;

        // Did the household change?
        if (context.state.currentHousehold.Id !== prevProps.context.state.currentHousehold.Id) {
            // Is there an existing household?
            if (context.state.currentHousehold.Id) {
                this.populateMemberGrid(context.state.currentHousehold.Id);
            } else {
                this.setState({members: null});
            }

            // Work around for React stupidity
            if (context.state.currentHousehold.Id === null) {
                const named = document.querySelectorAll('[name]') as INodeListOf;
                for (const namedElement of named) {
                    if (namedElement.value) {
                        namedElement.value = context.state.currentHousehold[namedElement.name];
                    }
                }
            }
        }
    }

    /**
     * On Error handler
     *
     * @param {object | string} error
     */
    private onError(error: object | string): void
    {
        this.props.context.methods.setError(error);
    }

    /**
     * Called when the global currentHousehold is changed.
     */
    private householdUpdated()
    {
        // If autoSave is true then invoke the handleSave event.
        if (this.state.autoSave) {
            this.handleSave(); // This resets autoSave to false;
        }
    }

    /**
     * Handle when text, checkboxes, etc. are changed.
     *
     * @param {FormEvent} e
     */
    private handleOnChange(e: FormEvent<FormControl>)
    {
        e.preventDefault();
        const context = this.props.context;
        const methods = context.methods;
        const householdInfo = {...context.state.currentHousehold};

        const target = e.target as ITarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        householdInfo[name] = value;

        methods.setCurrentHousehold(householdInfo);
    }

    /**
     * Handle when the drop down control for the U.S. State selection changes.
     *
     * @param {string} stateCode
     */
    private handleStateCodeChanged(stateCode: string)
    {
        const context = this.props.context;
        const methods = context.methods;
        const householdInfo = {...context.state.currentHousehold};
        householdInfo.State = stateCode;
        methods.setCurrentHousehold(householdInfo);
    }

    /**
     * Handle when the drop-down control for the County selection changes.
     *
     * @param {string} countyCode
     */
    private handleCountyCodeChanged(countyCode: string)
    {
        const context = this.props.context;
        const methods = context.methods;
        const householdInfo = {...context.state.currentHousehold};
        householdInfo.County = countyCode;
        methods.setCurrentHousehold(householdInfo);
    }

    /**
     * Fires when a member is selected.
     * This will bring up the MemberEdit modal.
     *
     * @param {int} id The Member PK
     */
    private handleMemberSelected(id: number)
    {
        this.setState({selectedMemberInfo: getRecordById(id, this.state.members) as MemberType, showMemberEdit: true});
    }

    /**
     * Handle when the MemberEdit modal is closed.
     *
     * @param {object} memberInfo
     */
    private handleMemberEditClose(memberInfo: MemberType)
    {
        // No longer show the modal.
        this.setState({showMemberEdit: false});

        // Is the memberInfo truthy?
        if (memberInfo) {
            // Set the current member to the newly saved member.
            this.props.context.methods.setCurrentMember(memberInfo);

            // Update the member grid.
            const householdId = memberInfo.HouseholdId || 0;
            this.populateMemberGrid(householdId);
        }
    }

    /**
     * Fires when when Add Member is clicked.
     *
     * @param {MouseEvent} e
     */
    private handleAddMember(e: MouseEvent<Button>)
    {
        e.preventDefault();

        const context = this.props.context;

        // Set the selectedMember to an empty memberModel and bring up the MemberEdit modal form.
        const newMember = {...memberModel};
        newMember.HouseholdId = context.state.currentHousehold.Id;
        this.setState({selectedMemberInfo: {...newMember}, showMemberEdit: true});
    }

    /**
     * Fires when Household Demo is clicked
     *
     * @param {MouseEvent} e
     */
    private handleDemo(e: MouseEvent<Button>)
    {
        e.preventDefault();

        // Get a copy of the currentHousehold object and toggle the IsDemo property.
        const context = this.props.context;
        const methods = context.methods;
        const householdInfo = {...context.state.currentHousehold};
        householdInfo.IsDemo = !householdInfo.IsDemo;

        // Change the state of autoSave to true and then update the currentHousehold (which will trigger handleSave)
        this.setState({autoSave: true}, () => {methods.setCurrentHousehold(householdInfo); });
    }

    /**
     * Retrieve all the members for the given householdId which results in these being shown in the MemberGrid
     *
     * @param {int} householdId
     */
    private populateMemberGrid(householdId: number)
    {
        // Sanity check
        if (householdId === 0) {
            return;
        }

        this.props.memberProvider.read(householdId, 'household_id')
        .then((response) =>
        {
            // Did we find the member(s)? If we didn't get any members it just means that this is a new household.
            if (response.success) {
                this.setState({members: response.data});
            }
        })
        .catch((error) =>
        {
            this.onError(error);
        });
    }

    /**
     * Fires when the Save button for household has been clicked.
     *
     * @param {MouseEvent} [e]
     */
    private handleSave(e?: MouseEvent<Button>)
    {
        if (e) {
            e.preventDefault();
        }

        const context = this.props.context;
        const methods = context.methods;
        const currentHousehold = {...context.state.currentHousehold};

        // If household is homeless then make County null
        if (currentHousehold.Homeless) {
            currentHousehold.County = null;
        }

        // householdInfo.Id will be null if we should insert a new household.
        if (!context.state.currentHousehold.Id) {
            this.props.householdProvider.create(currentHousehold)
                .then((response) =>
                {
                    // Did the household get created?
                    if (response.success) {
                        methods.setCurrentHousehold(response.data);
                        this.setState({showSaved: true, autoSave: false});
                    } else {
                        this.onError(response);
                    }
                })
                .catch((error) =>
                {
                    this.onError(error);
                });
        } else {
            this.props.householdProvider.update(currentHousehold)
                .then((response) =>
                {
                    // Did the household get created?
                    if (response.status === 200) {
                        methods.setCurrentHousehold(response.data);
                        this.setState({showSaved: true, autoSave: false});
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

    public render()
    {
        const context = this.props.context;

        // Is there an existing household? If not do not render.
        if (!context.state.currentHousehold) {
            return (false);
        }

        return (
            <div>
                {this.state.showMemberBadge &&
                    <NewWindow
                        onUnload={() => {this.setState({showMemberBadge: false}); }}
                        title="Print Member Badge"
                    >
                        <MemberBadge
                            memberInfo={context.state.currentMember}
                            householdSize={context.state.householdSize}
                            photo={context.state.currentMemberPhoto}
                        />
                    </NewWindow>
                }

                <Form horizontal>
                    {/* MemberEdit Modal */}
                    <MemberEdit
                        show={this.state.showMemberEdit}
                        onHide={(memberInfo: MemberType) => this.handleMemberEditClose(memberInfo)}
                        keyboard={false}
                        memberInfo={this.state.selectedMemberInfo}
                    />

                    {this.state.showSaved &&
                        <ToasterAlert
                            timeout={3000}
                            onDismiss={() => {this.setState({showSaved: false}); }}
                        >
                            <b>Household Updated</b>
                        </ToasterAlert>
                    }

                    <Col md={4}>
                        <FormGroup controlId="household-name">
                            <Col componentClass={ControlLabel} sm={3}>Household Name</Col>
                            <Col sm={4}>
                                <FormControl
                                    name="HouseholdName"
                                    type="text"
                                    placeholder="Household Name"
                                    maxLength={45}
                                    value={context.state.currentHousehold.HouseholdName}
                                    onChange={(e) => this.handleOnChange(e)}
                                    onFocus={() => this.setState({householdNameHasFocus: true})}
                                    onBlur={() => this.setState({householdNameHasFocus: false})}
                                />
                                {this.state.householdNameHasFocus && !context.state.currentHousehold.HouseholdName &&
                                    <HelpBlock>Usually the last name of the head of household</HelpBlock>
                                }
                            </Col>
                        </FormGroup>

                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Address</Col>
                            <Col sm={5}>
                                <FormControl
                                    name="Address"
                                    type="text"
                                    placeholder="Address"
                                    maxLength={45}
                                    value={context.state.currentHousehold.Address}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                                <FormControl
                                    name="City"
                                    type="text"
                                    placeholder="City"
                                    maxLength={45}
                                    value={context.state.currentHousehold.City}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                                <StateDropdown
                                    className="form-control"
                                    selectedState={context.state.currentHousehold.State}
                                    onSelected={(stateCode: string) => this.handleStateCodeChanged(stateCode)}
                                />
                                <FormControl
                                    name={"Zip"}
                                    type="text"
                                    placeholder="Postal Code"
                                    maxLength={10}
                                    value={context.state.currentHousehold.Zip}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </Col>
                        </FormGroup>

                        <FormGroup
                            controlId="household-county"
                        >
                            <Col componentClass={ControlLabel} sm={3}>County</Col>
                            <Col sm={4}>
                                <CountyDropdown
                                    className="form-control"
                                    selectedCounty={context.state.currentHousehold.County}
                                    stateCode={context.state.currentHousehold.State}
                                    onSelected={(countyCode: string) => this.handleCountyCodeChanged(countyCode)}
                                />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="household-phone">
                            <Col componentClass={ControlLabel} sm={3}>Phone</Col>
                            <Col sm={3}>
                                <FormControl
                                    name="Phone"
                                    type="text"
                                    placeholder="Phone"
                                    maxLength={20}
                                    value={context.state.currentHousehold.Phone}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="household-rent">
                            <Col componentClass={ControlLabel} sm={3}>Rent/Mortgage $</Col>
                            <Col sm={3}>
                                <FormControl
                                    name="Rent"
                                    type="text"
                                    placeholder="Rent/Mortgage $"
                                    maxLength={8}
                                    value={context.state.currentHousehold.Rent}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="household-living-arangement">
                            <Col componentClass={ControlLabel} sm={3}>Living Arrangement</Col>
                            <Col sm={8}>
                                <Checkbox
                                    name="RentSubsidized"
                                    inline
                                    checked={context.state.currentHousehold.RentSubsidized}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Rent Subsidized
                                </Checkbox>

                                <Checkbox
                                    name="Own"
                                    inline
                                    checked={context.state.currentHousehold.Own}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Own
                                </Checkbox>

                                <Checkbox
                                    name="WithFriendsFamily"
                                    inline
                                    checked={context.state.currentHousehold.WithFriendsFamily}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    With Friends & Family
                                </Checkbox>

                                <Checkbox
                                    name="Homeless"
                                    inline
                                    checked={context.state.currentHousehold.Homeless}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Homeless
                                </Checkbox>
                            </Col>
                        </FormGroup>

                        <FormGroup
                            controlId="household-assistance"
                        >
                            <Col componentClass={ControlLabel} sm={3}>Do Any Household Members Have</Col>
                            <Col sm={8}>
                                <Checkbox
                                    name="FoodStamps"
                                    inline
                                    checked={context.state.currentHousehold.FoodStamps}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Food Stamps
                                </Checkbox>

                                <Checkbox
                                    name="WIC"
                                    inline
                                    checked={context.state.currentHousehold.WIC}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    WIC
                                </Checkbox>

                                <Checkbox
                                    name="FreeSchoolLunch"
                                    inline
                                    checked={context.state.currentHousehold.FreeSchoolLunch}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Free School Lunch
                                </Checkbox>

                                <Checkbox
                                    name="Medicaid"
                                    inline
                                    checked={context.state.currentHousehold.Medicaid}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Medicaid
                                </Checkbox>
                            </Col>
                        </FormGroup>

                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Vehicle</Col>
                            <Col sm={3}>
                                <FormControl
                                    name="VehicleMake"
                                    type="text"
                                    placeholder="Make"
                                    maxLength={45}
                                    value={context.state.currentHousehold.VehicleMake}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                                <FormControl
                                    name="VehicleModel"
                                    type="text"
                                    placeholder="Model"
                                    maxLength={45}
                                    value={context.state.currentHousehold.VehicleModel}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                                <FormControl
                                    name="VehicleYear"
                                    type="text"
                                    placeholder="Year"
                                    maxLength={4}
                                    value={context.state.currentHousehold.VehicleYear}
                                    onChange={(e) => this.handleOnChange(e)}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="household-save">
                            <Col componentClass={ControlLabel} sm={3}/>
                            <Col sm={6}>
                                {context.state.currentHousehold.Id ? (
                                    <Button
                                        bsStyle="primary"
                                        disabled={!context.state.currentHousehold.HouseholdName}
                                        onClick={(e) => this.handleSave(e)}
                                    >
                                        Save
                                    </Button>
                                ) : (
                                    <Button
                                        bsStyle="primary"
                                        disabled={!context.state.currentHousehold.HouseholdName}
                                        onClick={(e) => this.handleSave(e)}
                                    >
                                        Create New Household
                                    </Button>
                                )}

                                <span style={{paddingRight: "5px"}}/>
                            </Col>
                        </FormGroup>

                        {context.state.currentUser.IsAdmin &&
                            <FormGroup controlId="household-demo">
                                <Col componentClass={ControlLabel} sm={3}/>
                                <Col sm={6}>
                                    <Button
                                        bsStyle="danger"
                                        onClick={(e) => this.handleDemo(e)}
                                        disabled={!context.state.currentHousehold.HouseholdName}
                                    >
                                        {context.state.currentHousehold.IsDemo ? 'Remove' : 'Make'} Household Demo
                                    </Button>
                                </Col>
                            </FormGroup>
                        }
                    </Col>

                    {context.state.currentMember && context.state.currentMember.Id &&
                        <Col componentClass={ControlLabel} md={3}>
                            <MemberPanel/>
                            <Button
                                onClick={() => {this.setState({showMemberBadge: true}); }}
                            >
                                Print Badge
                            </Button>
                        </Col>
                    }

                    <Col md={5}>
                        <FormGroup controlId="household-poverty">
                            <PovertyPanel
                                householdSize={null || context.state.householdSize}
                                language="en"
                            />
                        </FormGroup>

                        {this.state.members && this.state.members.length > 0 &&
                            <FormGroup controlId="household-members">
                                <MemberGrid
                                    members={this.state.members}
                                    onMemberSelected={(id: number) => this.handleMemberSelected(id)}
                                />
                            </FormGroup>
                        }

                        {/* Only display the Add Member if we have an existing Household record */}
                        {context.state.currentHousehold.Id &&
                            <Button
                                bsStyle="primary"
                                onClick={(e: MouseEvent<Button>) => this.handleAddMember(e)}
                            >
                                Add Member
                            </Button>
                        }

                    </Col>
                </Form>
            </div>
        );
    }
}
