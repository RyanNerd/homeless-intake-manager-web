import * as React from "react";
import {Component, MouseEvent} from "react";
import {
        Table,
        Button
} from 'react-bootstrap';
import {
        getRecordById,
        UpdateLanguage
} from "../../utils/utilities";
import {IntakeType} from "../../models/IntakeModel";

interface IntakeGridProps
{
    onIntakeSelected: Function
    language: string,
    intakes: IntakeType[]
}

const initialSelectedIntakeId: number | null = null;
const initialLanguage: string | null = null;
const initialState =  {
        selectedIntakeId: initialSelectedIntakeId,
        language: initialLanguage
};
type State = Readonly<typeof initialState>

/**
 * IntakeGrid Class - Intake Table
 */
export class IntakeGrid extends Component<IntakeGridProps, State>
{
    readonly state: State = initialState;

    /**
     * Lifecycle hook - componentDidUpdate
     */
    componentDidUpdate()
    {
        if (this.props.language && this.props.language !== this.state.language) {
            UpdateLanguage(this.props.language);
        }
    }

    /**
     * Handle when an intake is selected from the intake grid
     *
     * @param {Event} e
     * @param {int} id
     */
    handleIntakeSelected(e: MouseEvent<Button>, id: number | null)
    {
        if (e) {
            let intakeInfo = getRecordById(id, this.props.intakes);
            this.props.onIntakeSelected(intakeInfo);
        }
    }

    render()
    {
        const IntakeRow = (intake: IntakeType) =>
        {
            const year = intake.IntakeYear;
            const month = intake.IntakeMonth ? parseInt(intake.IntakeMonth.toString()).pad(2) : '';
            const day = intake.IntakeDay ? parseInt(intake.IntakeDay.toString()).pad(2) : '';
            const intakeDate = year + '-' + month + '-' + day;
            const notes = intake.Notes || "";

            return (
                <tr
                    key={'intake-grid-row-' + intake.Id}
                    id={'intake-grid-row-' + intake.Id}
                    className="intake-grid-row"
                >
                    <td>
                        <Button
                            id={"member-grid-button-" + intake.Id}
                            className={"member-grid-button"}
                            onClick={(e: MouseEvent<Button>)=>{this.handleIntakeSelected(e, intake.Id)}}
                        >
                            Select
                        </Button>
                    </td>
                    <td><input type="text" value={intakeDate} disabled={true}/></td>
                    <td><input type="checkbox" checked={intake.FoodBox} disabled={true}/></td>
                    <td><input type="checkbox" checked={intake.Perishable} disabled={true}/></td>
                    <td><input type="checkbox" checked={intake.Camper} disabled={true}/></td>
                    <td><input type="checkbox" checked={intake.Diaper} disabled={true}/></td>
                    <td><input type="text" value={intake.FoodBoxWeight} disabled={true}/></td>
                    <td><input type="text" value={intake.PerishableWeight} disabled={true}/></td>
                    <td><input type="text" value={notes} disabled={true}/></td>
                </tr>
            )
        };

        if (!this.props.intakes) {
            return (false);
        } else {
            return (
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th/>
                        <th data-l10n-id="en-date">Date</th>
                        <th data-l10n-id="en-food-box">Food Box</th>
                        <th data-l10n-id="en-perishables">Perishables</th>
                        <th data-l10n-id="en-camper">Camper Special</th>
                        <th data-l10n-id="en-diaper">Diaper</th>
                        <th data-l10n-id="en-food-box-weight">Food Box Weight</th>
                        <th data-l10n-id="en-perishable-weight">Perishable Weight</th>
                        <th data-l10n-id="en-notes">Notes</th>
                    </tr>
                    </thead>
                    {this.props.intakes &&
                        <tbody>
                            {this.props.intakes.map(IntakeRow)}
                        </tbody>
                    }
                </Table>
            );
        }
    }
}