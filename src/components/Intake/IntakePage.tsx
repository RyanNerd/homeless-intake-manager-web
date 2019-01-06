import * as React from "react";
import {Component, MouseEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
        Col,
        Row,
        Alert,
        Button,
        Checkbox,
        ControlLabel
} from "react-bootstrap";
import {IntakeEdit} from "./IntakeEdit";
import {IntakeGrid} from "./IntakeGrid";
import {intakeModel, IntakeType} from "../../models/IntakeModel";
import {MemberPanel} from "../Member/MemberPanel";
import {PovertyPanel} from "../Poverty/PovertyPanel";
import {IntakeProvider} from "../../providers/IntakeProvider";
import {
        calculateAge,
        dateToString,
        dateDiffInDays,
        UpdateLanguage
} from "../../utils/utilities";
import {ITarget} from "../../typings/HtmlInterfaces";

interface IProps {
    intakeProvider: IntakeProvider;
    context: ContextType;
}

const initialIntakeData: IntakeType[] = [];
const initialHouseholdId: number | null = null;
const initialIntakeInfo: IntakeType | null = null;
const initialIntakeDays: number | null = null;
const initialState = {
    intakeForTodayExists: false,
    showIntakeEdit: false,
    householdId: initialHouseholdId,
    intakeInfo: initialIntakeInfo,
    intakeData: initialIntakeData,
    intakeDays: initialIntakeDays,
    language: "en"
};

type State = Readonly<typeof initialState>;

export const IntakePage = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <IntakePageBase
                context={context}
                intakeProvider={new IntakeProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * IntakePage Class
 *
 */
class IntakePageBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Lifecycle hook - componentDidUpdate
     */
    public componentDidUpdate()
    {
        const context = this.props.context;

        if (context.state.currentMember.HouseholdId !== this.state.householdId) {
            this.setState({householdId: context.state.currentMember.HouseholdId});
            this.populateIntakeGrid();
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
     * Reload intakeData for the household from the database.
     */
    private populateIntakeGrid()
    {
        const householdId = this.props.context.state.currentMember.HouseholdId;

        // Do we have an existing household?
        if (householdId) {
            // Get the intake history for the household
            this.props.intakeProvider.read(householdId, 'HouseholdId', false)
            .then((response) =>
            {
                // Did we get any Intake data?
                if (response.success) {
                    return response.data;
                } else {
                    // If this is NOT a 404 error then something went wrong, otherwise then no pantry intake history
                    if (response.status !== 404) {
                        this.onError(response);
                    }
                }
                return null;
            })
            .then((data) =>
            {
                // Is there any Intake data?
                if (data) {
                    // Sort the Intake data array by latest intake date first.
                    const intakeData = data.sort((a, b) =>
                    {
                        const intakeDate1 = parseInt(a.IntakeYear, 10).pad(4) +
                                            parseInt(a.IntakeMonth, 10).pad(2) +
                                            parseInt(a.IntakeDay, 10).pad(2);
                        const intakeDate2 = parseInt(b.IntakeYear, 10).pad(4) +
                                            parseInt(b.IntakeMonth, 10).pad(2) +
                                            parseInt(b.IntakeDay, 10).pad(2);
                        if (intakeDate1 < intakeDate2) {
                            return 1;
                        }
                        return 0;
                    });

                    // Set the IntakeData to state.
                    this.setState({intakeData: intakeData}, () =>
                    {
                        // Now that IntakeData is in state we calculate intakeDays, & intakeForTodayExists & save state.
                        this.setState({
                            intakeForTodayExists: this.intakeForTodayExists(),
                            intakeDays: this.intakeDays()
                        });
                    });
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        }
    }

    /**
     * Language toggle handler
     *
     * @param {MouseEvent} e
     */
    private handleLanguageChange(e: MouseEvent<Button>)
    {
        let language;
        const target = e.target as ITarget;
        if (target.checked) {
            language = 'es';
        } else {
            language = 'en';
        }

        UpdateLanguage(language);
        this.setState({language: language});
    }

    /**
     * Callback when an intake is selected from the grid.
     *
     * @param {IntakeType} intakeInfo
     */
    private onIntakeSelected(intakeInfo: IntakeType)
    {
        // Set intakeInfo and show the IntakeEdit modal
        this.setState({intakeInfo: {...intakeInfo}, showIntakeEdit: true});
    }

    /**
     * Handle when New Intake button clicked
     *
     * @param {MouseEvent} e
     */
    private handleAddIntake(e: MouseEvent<Button>)
    {
        e.preventDefault();

        const context = this.props.context;

        const intakeInfo = {...intakeModel};
        intakeInfo.MemberId = context.state.currentMember.Id;
        intakeInfo.HouseholdId = context.state.currentMember.HouseholdId;
        this.setState({intakeInfo: intakeInfo, showIntakeEdit: true});
    }

    /**
     * Handle when the IntakeEdit modal is dismissed.
     *
     * @param {boolean} shouldRefresh True if the Intake Grid needs a refresh, false otherwise.
     */
    private handleIntakeEditClose(shouldRefresh: boolean)
    {
        this.setState({showIntakeEdit: false, intakeInfo: null});

        if (shouldRefresh) {
            this.populateIntakeGrid();
        }
    }

    ///////////////////
    // Validation Logic
    ///////////////////

    /**
     * Returns true if the intakes array has an entry for today.
     *
     * @return {boolean} True if there is an intake record for today, false otherwise.
     */
    private intakeForTodayExists(): boolean
    {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // Really JavaScript this is zero based?
        const day = today.getDate(); // Really JavaScript this isn't zero based? Way to be inconsistent.

        for (const intakeRecord of this.state.intakeData) {
            if (year  === parseInt(intakeRecord.IntakeYear, 10)  &&
                month === parseInt(intakeRecord.IntakeMonth, 10) &&
                day   === parseInt(intakeRecord.IntakeDay, 10)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return the number of days since last intake
     *
     * @return {int | null}
     */
    private intakeDays(): number | null
    {
        const today = dateToString(new Date());

        const days = [];
        for (const intakeRecord of this.state.intakeData) {
            days.push(dateDiffInDays(
                    intakeRecord.IntakeYear + '-' + intakeRecord.IntakeMonth + '-' + intakeRecord.IntakeDay,
                    today
            ));
        }

        if (days.length > 0) {
            return Math.min(...days);
        } else {
            return null;
        }
    }

    public render()
    {
        const context = this.props.context;
        const member = context.state.currentMember;
        const birthYear  = member.BirthYear  ? parseInt(member.BirthYear, 10).pad(4) : '';
        const birthMonth = member.BirthMonth ? parseInt(member.BirthMonth, 10).pad(2) : '';
        const birthDay   = member.BirthDay   ? parseInt(member.BirthDay, 10).pad(2) : '';
        const dob = birthYear + '-' + birthMonth + '-' + birthDay;
        const age = calculateAge(dob);

        return (
            <div style={{marginLeft: "15px"}}>
                {age < 18 &&
                    <Alert bsStyle={"warning"}>
                        <b style={{color: "red"}}>
                            WARNING:
                        </b>
                        <b>
                            Current member ({member.FirstName + ' ' + member.LastName}) is a minor.
                        </b>
                    </Alert>
                }

                {!member.Active &&
                    <Alert bsStyle={"danger"}>
                        <b style={{color: "red"}}>
                            WARNING:
                        </b>
                        <b>
                            Current member ({member.FirstName + ' ' + member.LastName}) is not active.
                        </b>
                    </Alert>
                }

                <Row>
                    <Col componentClass={ControlLabel} md={3}>
                        <MemberPanel
                            readOnly={true}
                        />
                    </Col>

                    <Col md={3}>
                        <div>
                            <p data-l10n-id="en-certify">certify</p>
                            <p data-l10n-id="en-equal-opportunity">Equal Opportunity</p>
                        </div>

                        <Checkbox
                            onChange={(e: MouseEvent<Button>) => {this.handleLanguageChange(e); }}
                        >
                            Show in spanish
                        </Checkbox>

                        <hr/>

                        <Button
                            disabled={this.state.intakeForTodayExists}
                            onClick={(e: MouseEvent<Button>) => {this.handleAddIntake(e); }}
                            bsStyle="primary"
                        >
                            New Intake
                        </Button>
                    </Col>

                    <Col md={4}>
                        <PovertyPanel
                            language={this.state.language}
                            householdSize={context.state.householdSize}
                        />
                    </Col>
                </Row>

                <Row>
                    <h2 style={{textAlign: "center", color: "black"}}>
                        Household Pantry History
                    </h2>

                    <h4 style={{textAlign: "center"}}>
                        Number of Days Since Last Use:
                        {this.state.intakeDays && (this.state.intakeDays > 0 && this.state.intakeDays < 8) ?
                            (
                                <span style={{fontWeight: "bold", color: "red", paddingLeft: "5px"}}>
                                    {this.state.intakeDays}
                                </span>
                            ) : (
                                <span style={{fontWeight: "bold", paddingLeft: "5px"}}>
                                    {this.state.intakeDays}
                                </span>
                            )
                        }
                    </h4>

                    < IntakeGrid
                        onIntakeSelected={(intakeInfo: IntakeType) => this.onIntakeSelected(intakeInfo)}
                        intakes={this.state.intakeData}
                        language={this.state.language}
                    />
                </Row>

                {/* IntakeEdit Modal */}
                <IntakeEdit
                    show={this.state.showIntakeEdit}
                    onHide={(shouldRefresh: boolean) => this.handleIntakeEditClose(shouldRefresh)}
                    keyboard={true}
                    language={this.state.language}
                    intakeInfo={this.state.intakeInfo}
                />
            </div>
        );
    }
}
