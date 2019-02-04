import * as React from "react";
import {Component, FormEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
        Col,
        Form,
        Modal,
        Radio,
        Button,
        Checkbox,
        FormGroup,
        FormControl,
        ControlLabel
} from 'react-bootstrap';
import {isNameValid} from "../../utils/validation";
import {MemberProvider} from "../../providers/MemberProvider";
import {HouseholdProvider} from "../../providers/HouseholdProvider";
import {MemberType} from "../../models/MemberModel";
import {ITarget} from "../../typings/HtmlInterfaces";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const BADGE_LENGTH_MAX = 6;

interface IProps {
    householdProvider: HouseholdProvider;
    memberProvider: MemberProvider;
    memberInfo: MemberType;
    keyboard: boolean;
    context: ContextType;
    onHide: (memberData: any) => void;
    show: boolean;
}

const validationTypes: "error" | "warning" | "success" | null = null;
const initialMemberInfo: MemberType | null = null;
const initialCanSave: boolean | null = null;
const initialState = {
        validGender: validationTypes,
        shouldShow: false,
        memberInfo: initialMemberInfo,
        validName: validationTypes,
        validDOB: validationTypes,
        canSave: initialCanSave
};
type State = Readonly<typeof initialState>;

export const MemberEdit = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <MemberEditBase
                context={context}
                memberProvider={new MemberProvider(context.state.currentUser.AuthKey)}
                householdProvider={new HouseholdProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * MemberEdit Class Modal
 */
class MemberEditBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Lifecycle hook - getDerivedStateFromProps
     *
     * @param {IProps} nextProps
     * @return {State | null}
     */
    public static getDerivedStateFromProps(nextProps: IProps)
    {
        if (nextProps.memberInfo && nextProps.show) {
            return {memberInfo: nextProps.memberInfo, shouldShow: true};
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
        this.setState({shouldShow: false});
    }

    /**
     * Fires when the modal has played all the animations and is displayed.
     * Similar to componentDidUpdate()
     */
    private handleOnEntered()
    {
        // Modal is now displayed so validate the memberInfo.
        this.validate();
    }

    /**
     * Fires when the modal is closing either from cancel or save
     *
     * @param {Event} e
     * @param {bool} shouldSave
     */
    private handleModalDismiss(e: FormEvent<FormControl>, shouldSave: boolean)
    {
        // Was the save button clicked to dismiss?
        if (shouldSave) {
            this.props.memberProvider.create(this.state.memberInfo)
            .then((response) =>
            {
                if (response.success) {
                    this.updateHouseholdCount(this.state.memberInfo.HouseholdId);
                    this.props.onHide(response.data);
                } else {
                    this.onError(response);
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        } else {
            this.props.onHide(null);
        }
    }

    /**
     * Update number of members in household
     *
     * @param {int} householdId
     * @private
     */
    private updateHouseholdCount(householdId: number)
    {
        const methods = this.props.context.methods;
        this.props.householdProvider.memberCount(householdId)
        .then((response) =>
        {
            methods.setHouseholdSize(response);
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
        const memberInfo = this.state.memberInfo;

        const target = e.target as ITarget;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        memberInfo[name] = value;

        this.setState({memberInfo: memberInfo}, () => {this.validate(name); });
    }

    //////////////
    // Validations
    //////////////

    /**
     * Main validator
     *
     * @param {string} [name] The name of the field to be validated.
     */
    private validate(name?: string)
    {
        if (!name) {
            this.setState({
                validName: this.validNameState(),
                validDOB: this.validDOBState(),
                validGender: this.validGenderState(),
            }, () => {this.canSave(); });
            return;
        }

        switch (name) {
            case 'FirstName':
                this.setState({validName: this.validNameState()}, () => {this.canSave(); });
                break;
            case 'LastName':
                this.setState({validName: this.validNameState()}, () => {this.canSave(); });
                break;
            case 'BirthYear':
                this.setState({validDOB: this.validDOBState()}, () => {this.canSave(); });
                break;
            case 'BirthMonth':
                this.setState({validDOB: this.validDOBState()},  () => {this.canSave(); });
                break;
            case 'BirthDay':
                this.setState({validDOB: this.validDOBState()}, () => {this.canSave(); });
                break;
            case 'Gender':
                this.setState({validGender: this.validGenderState()}, () => {this.canSave(); });
        }
    }

    /**
     * Set save state to true if the data is in a valid state that changes can be saved.
     */
    private canSave()
    {
        this.setState({canSave: !(this.state.validName || this.state.validDOB || this.state.validGender)});
    }

    /**
     * Validate full name fields
     *
     * @return {string | null} Return null if valid, otherwise 'error' or 'warning' string.
     */
    private validNameState(): "error" | "warning" | "success" | null
    {
        return this.validFirstName() || this.validLastName();
    }

    /**
     * Validate FirstName field
     *
     * @return {string | null} Returns 'error' if the first name is not valid, null otherwise.
     */
    private validFirstName(): "error" | "warning" | "success" | null
    {
        const firstName = this.state.memberInfo.FirstName;
        if (!firstName || firstName === '') {
            return 'warning';
        }

        if (!isNameValid(firstName)) {
            return 'error';
        }
        return null;
    }

    /**
     * Validate LastName field
     *
     * @return {string | null} Returns 'error' if the first name is not valid, null otherwise.
     */
    private validLastName(): "error" | "warning" | "success" | null
    {
        const lastName = this.state.memberInfo.LastName;
        if (!lastName || lastName === '') {
            return 'warning';
        }

        if (!isNameValid(lastName)) {
            return 'error';
        }
        return null;
    }

    /**
     * Validate date of birth fields
     *
     * @return {string | null} Return null if valid, otherwise 'error' or 'warning'.
     */
    private validDOBState(): "error" | "warning" | "success" | null
    {
        return this.validBirthYear() || this.validBirthMonth() || this.validBirthDay();
    }

    /**
     * Validate the birth year field
     *
     * @return {string | null} Return null if year is valid, otherwise 'error' or 'warning'
     */
    private validBirthYear(): "error" | "warning" | "success" | null
    {
        const birthYear = parseInt(this.state.memberInfo.BirthYear, 10);
        if (!birthYear) {
            return 'warning';
        }

        const now = new Date();
        const minYear = now.getFullYear() - 120;
        if (birthYear < minYear || birthYear > currentYear) {
            return 'error';
        }

        return null;
    }

    /**
     * Validate the birth month field
     *
     * @return {null | string} Return null if valid, otherwise 'error', or 'warning'
     */
    private validBirthMonth(): "error" | "warning" | "success" | null
    {
        const birthMonth = parseInt(this.state.memberInfo.BirthMonth, 10);
        if (!birthMonth) {
            return 'warning';
        }
        if (birthMonth < 1 || birthMonth > 12) {
            return 'error';
        }
        return null;
    }

    /**
     * Validate birth day field
     *
     * @return {null | string} Return null if valid, otherwise 'error', or 'warning'
     */
    private validBirthDay(): "error" | "warning" | "success" | null
    {
        const birthDay = parseInt(this.state.memberInfo.BirthDay, 10);
        if (!birthDay) {
            return 'warning';
        }

        if (birthDay < 1 || birthDay > 31) {
            return 'error';
        }

        const birthMonth = parseInt(this.state.memberInfo.BirthMonth, 10);
        if (birthMonth === 2 && birthDay > 28) {
            return 'error';
        }
        if (birthMonth === 7 && birthDay > 30) {
            return 'error';
        }
        return null;
    }

    /**
     * Validate the gender field
     *
     * @return {null | string} Return null if valid, otherwise 'error', or 'warning'
     */
    private validGenderState(): "error" | "warning" | "success" | null
    {
        const gender = this.state.memberInfo.Gender;
        if (!gender) {
            return 'warning';
        }

        if (!(gender === 'M' || gender === 'F')) {
            return 'error';
        }
        return null;
    }

    public render()
    {
        return(
            <Modal
                bsSize="large"
                show={this.state.shouldShow}
                onHide={(e: FormEvent<FormControl>) => this.handleModalDismiss(e, false)}
                onEntered={() => this.handleOnEntered()}
                keyboard={this.props.keyboard}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Member Maintenance ({this.state.memberInfo &&
                            this.state.memberInfo.Id &&
                            parseInt(this.state.memberInfo.Id, 10).pad(BADGE_LENGTH_MAX)})
                    </Modal.Title>
                </Modal.Header>

                {this.state.memberInfo &&
                    <Modal.Body>
                        <Form horizontal>
                            <FormGroup
                                controlId="member-name"
                                validationState={this.state.validName}
                            >
                                <Col componentClass={ControlLabel} sm={1}>
                                    Name
                                </Col>

                                <Col sm={3}>
                                    <span>First</span>
                                    <FormControl
                                        type="text"
                                        placeholder="First Name"
                                        maxLength={50}
                                        value={this.state.memberInfo.FirstName}
                                        name="FirstName"
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>

                                <Col sm={1}>
                                    <span>Middle</span>
                                    <FormControl
                                        type="text"
                                        placeholder="Middle Initial"
                                        maxLength={1}
                                        value={this.state.memberInfo.MiddleInitial}
                                        name="MiddleInitial"
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>

                                <Col sm={3}>
                                    <span>Last</span>
                                    <FormControl
                                        type="text"
                                        placeholder="Last Name"
                                        maxLength={50}
                                        value={this.state.memberInfo.LastName}
                                        name="LastName"
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup
                                controlId="member-dob"
                                validationState={this.state.validDOB}
                            >
                                <Col componentClass={ControlLabel} sm={1}>
                                    Birth Date
                                </Col>
                                <Col sm={2}>
                                    <span>Year</span>
                                    <FormControl
                                        type="text"
                                        placeholder="Year"
                                        maxLength={4}
                                        value={this.state.memberInfo.BirthYear}
                                        name="BirthYear"
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                                <Col sm={1}>
                                    <span>Month</span>
                                    <FormControl
                                        type="text"
                                        placeholder="Month"
                                        maxLength={2}
                                        value={this.state.memberInfo.BirthMonth}
                                        name="BirthMonth"
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                                <Col sm={1}>
                                    <span>Day</span>
                                    <FormControl
                                        type="text"
                                        placeholder="Day"
                                        maxLength={2}
                                        value={this.state.memberInfo.BirthDay}
                                        name="BirthDay"
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup
                                controlId="member-gender"
                                validationState={this.state.validGender}
                            >
                                <Col componentClass={ControlLabel} sm={1}>Gender</Col>
                                <Col sm={3}>
                                <Radio
                                    inline
                                    value="M"
                                    checked={this.state.memberInfo.Gender === 'M'}
                                    name="Gender"
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Male
                                </Radio>
                                <Radio
                                    style={{paddingRight: "10px"}}
                                    name="Gender"
                                    inline
                                    value="F"
                                    checked={this.state.memberInfo.Gender === 'F'}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Female
                                </Radio>{" "}
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="member-ids">
                                <Col componentClass={ControlLabel} sm={1}>SSN/DL</Col>
                                <Col md={3}>
                                    <FormControl
                                        name="SSN"
                                        type="text"
                                        placeholder="000-00-0000"
                                        maxLength={11}
                                        value={this.state.memberInfo.SSN}
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                                <Col sm={3}>
                                    <FormControl
                                        name="DL"
                                        type="text"
                                        placeholder="State Id#"
                                        maxLength={20}
                                        value={this.state.memberInfo.DL}
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={1}>Status</Col>
                                <Checkbox
                                    inline
                                    checked={this.state.memberInfo.Disability}
                                    name="Disability"
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Disability
                                </Checkbox>

                                <Checkbox
                                    inline
                                    checked={this.state.memberInfo.Veteran}
                                    name="Veteran"
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Veteran
                                </Checkbox>

                                <Checkbox
                                    inline
                                    name="Active"
                                    checked={this.state.memberInfo.Active}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Member is Active
                                </Checkbox>
                            </FormGroup>

                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={1}>Ethnic</Col>
                                <Radio
                                    name="Race"
                                    inline
                                    value="A"
                                    checked={this.state.memberInfo.Race === 'A'}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Asian
                                </Radio>
                                <Radio
                                    name="Race"
                                    inline
                                    value="B"
                                    checked={this.state.memberInfo.Race === 'B'}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Black
                                </Radio>
                                <Radio
                                    name="Race"
                                    inline
                                    value="H"
                                    checked={this.state.memberInfo.Race === 'H'}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Hispanic
                                </Radio>
                                <Radio
                                    name="Race"
                                    inline
                                    value="N"
                                    checked={this.state.memberInfo.Race === 'N'}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Native American
                                </Radio>

                                <Radio
                                    name="Race"
                                    inline
                                    value="P"
                                    checked={this.state.memberInfo.Race === 'P'}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Pacific Islander
                                </Radio>
                                <Radio
                                    name="Race"
                                    inline
                                    value="W"
                                    checked={this.state.memberInfo.Race === 'W'}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    White
                                </Radio>
                                <Radio
                                    name="Race"
                                    inline
                                    value="O"
                                    checked={this.state.memberInfo.Race === 'O'}
                                    onChange={(e) => this.handleOnChange(e)}
                                >
                                    Other
                                </Radio>
                            </FormGroup>

                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={1}>Education</Col>
                                <Col sm={9}>
                                    <Radio
                                        style={{paddingLeft: "30px"}}
                                        name="Education"
                                        inline
                                        value="I"
                                        checked={this.state.memberInfo.Education === 'I'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        0-3 Years
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="P"
                                        checked={this.state.memberInfo.Education === 'P'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Preschool
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="K"
                                        checked={this.state.memberInfo.Education === 'K'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Kindergarten
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="Y"
                                        checked={this.state.memberInfo.Education === 'Y'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Youth:1st-6th Grade
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="9"
                                        checked={this.state.memberInfo.Education === '9'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        9th or less
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="10"
                                        checked={this.state.memberInfo.Education === '10'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        10th
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="11"
                                        checked={this.state.memberInfo.Education === '11'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        11th
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="12"
                                        checked={this.state.memberInfo.Education === '12'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        12th
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="H"
                                        checked={this.state.memberInfo.Education === 'H'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        High School Grad
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="G"
                                        checked={this.state.memberInfo.Education === 'G'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        GED
                                    </Radio>
                                    <Radio
                                        name="Education"
                                        inline
                                        value="S"
                                        checked={this.state.memberInfo.Education === 'S'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        12+(Post Secondary)
                                    </Radio>
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="member-degree">
                                <Col componentClass={ControlLabel} sm={1}>Degrees</Col>
                                <Col sm={5}>
                                    <Checkbox
                                        name="EducationAssociate"
                                        inline
                                        checked={this.state.memberInfo.EducationAssociate}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Associates
                                    </Checkbox>
                                    <Checkbox
                                        name="EducationBachelors"
                                        inline
                                        checked={this.state.memberInfo.EducationBachelors}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Bachelors
                                    </Checkbox>
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="member-work">
                                <Col componentClass={ControlLabel} sm={2}>Employment</Col>
                                <Col md={13}>
                                    <Checkbox
                                        name="CanWork"
                                        inline
                                        checked={this.state.memberInfo.CanWork}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Is this person able to work
                                    </Checkbox>

                                    <Checkbox
                                        name="Employed"
                                        inline
                                        disabled={!this.state.memberInfo.CanWork}
                                        checked={this.state.memberInfo.Employed}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Currently Employed
                                    </Checkbox>
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="member-income">
                                <Col componentClass={ControlLabel} sm={2}>Frequency</Col>
                                <Col md={13}>
                                    <Radio
                                        name="IncomeType"
                                        inline
                                        value="W"
                                        checked={this.state.memberInfo.IncomeType === 'W'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Weekly
                                    </Radio>
                                    <Radio
                                        name="IncomeType"
                                        inline
                                        value="B"
                                        checked={this.state.memberInfo.IncomeType === 'B'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Bi-Monthly
                                    </Radio>
                                    <Radio
                                        name="IncomeType"
                                        inline
                                        value="M"
                                        checked={this.state.memberInfo.IncomeType === 'M'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Monthly
                                    </Radio>
                                    <Radio
                                        name="IncomeType"
                                        inline
                                        value="A"
                                        checked={this.state.memberInfo.IncomeType === 'A'}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Annual
                                    </Radio>
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="member-income">
                                <Col componentClass={ControlLabel} sm={2}>Total Income</Col>
                                <Col md={3}>
                                    <FormControl
                                        name="IncomeTotal"
                                        type="text"
                                        placeholder="$"
                                        value={this.state.memberInfo.IncomeTotal}
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                                <Col sm={3}>
                                    <FormControl
                                        name="IncomeOther"
                                        type="text"
                                        placeholder="Other sources of income"
                                        maxLength={45}
                                        value={this.state.memberInfo.IncomeOther}
                                        onChange={(e) => this.handleOnChange(e)}
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="member-income-source">
                                <Col componentClass={ControlLabel} sm={2}>Additional Sources</Col>
                                <Col md={6}>
                                    <Checkbox
                                        name="IncomeSSI"
                                        inline
                                        checked={this.state.memberInfo.IncomeSSI}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        SSI/SSDI
                                    </Checkbox>
                                    <Checkbox
                                        name="IncomeSocialSecurity"
                                        inline
                                        checked={this.state.memberInfo.IncomeSocialSecurity}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                       Social Security
                                    </Checkbox>
                                    <Checkbox
                                        name="IncomeChildSupport"
                                        inline
                                        checked={this.state.memberInfo.IncomeChildSupport}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Child Support
                                    </Checkbox>
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="member-health-insurance">
                                <Col componentClass={ControlLabel} sm={2}>Insurance</Col>
                                <Col md={10}>
                                    <Checkbox
                                        name="HealthInsurance"
                                        checked={this.state.memberInfo.HealthInsurance}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Member has Health Insurance
                                    </Checkbox>
                                    <Checkbox
                                        name="HealthInsurancePrivate"
                                        disabled={!this.state.memberInfo.HealthInsurance}
                                        inline
                                        checked={this.state.memberInfo.HealthInsurancePrivate}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Private
                                    </Checkbox>
                                    <Checkbox
                                        name="HealthInsuranceMedicaid"
                                        disabled={!this.state.memberInfo.HealthInsurance}
                                        inline
                                        checked={this.state.memberInfo.HealthInsuranceMedicaid}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Medicaid
                                    </Checkbox>
                                    <Checkbox
                                        name="HealthInsuranceMedicare"
                                        disabled={!this.state.memberInfo.HealthInsurance}
                                        inline
                                        checked={this.state.memberInfo.HealthInsuranceMedicare}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Medicare
                                    </Checkbox>
                                    <Checkbox
                                        name="HealthInsuranceCHIP"
                                        disabled={!this.state.memberInfo.HealthInsurance}
                                        inline
                                        checked={this.state.memberInfo.HealthInsuranceCHIP}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        CHIP
                                    </Checkbox>
                                    <Checkbox
                                        name="HealthInsurancePCN"
                                        disabled={!this.state.memberInfo.HealthInsurance}
                                        inline
                                        checked={this.state.memberInfo.HealthInsurancePCN}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        PCN
                                    </Checkbox>
                                </Col>
                            </FormGroup>

{/*
                            <FormGroup controlId="member-status">
                                <Col componentClass={ControlLabel} sm={2}>Status</Col>
                                <Col md={10}>
                                    <Checkbox
                                        name="Active"
                                        checked={this.state.memberInfo.Active}
                                        onChange={(e) => this.handleOnChange(e)}
                                    >
                                        Member is Active
                                    </Checkbox>
                                </Col>
                            </FormGroup>
*/}
                        </Form>
                    </Modal.Body>
                }

                <Modal.Footer>
                    <Button onClick={(e) => this.handleModalDismiss(e, false)}>Cancel</Button>
                    <Button
                        onClick={(e) => this.handleModalDismiss(e, true)}
                        bsStyle="primary"
                        disabled={!this.state.canSave}
                    >
                        Save changes
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
