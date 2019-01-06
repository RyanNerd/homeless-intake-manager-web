import * as React from "react";
import {Component, MouseEvent} from "react";
import {
        Table,
        Button
} from 'react-bootstrap';
import {PovertyType} from "../../models/PovertyModel";

interface IProps {
    onPovertySelected: (povertyInfo: PovertyType) => void;
    povertyData: PovertyType[];
}

/**
 * PovertyGrid Class
 */
export class PovertyGrid extends Component<IProps, {}>
{
    /**
     * Handle when a poverty record is selected from the grid
     *
     * @param {Event} e
     * @param {object} povertyInfo
     */
    private handlePovertySelected(e: MouseEvent<Button>, povertyInfo: PovertyType)
    {
        e.preventDefault();

        this.props.onPovertySelected(povertyInfo);
    }

    public render()
    {
        const PovertyRow = (poverty: PovertyType) =>
        {
            const rowClassName = "poverty-grid-row";
            const buttonClassName = "poverty-grid-button";

            return (
                <tr
                    key={'poverty-grid-row-' + poverty.Id}
                    className={rowClassName}
                    id={'poverty-grid-row-' + poverty.Id}
                >
                    <td>
                        <Button
                            id={"poverty-grid-button-" + poverty.Id}
                            className={buttonClassName}
                            onClick={(e: MouseEvent<Button>) => {this.handlePovertySelected(e, poverty); }}
                        >
                            Select
                        </Button>
                    </td>
                    <td>{poverty.Id}</td>
                    <td>{poverty.Monthly}</td>
                </tr>
            );
        };

        return (
            <Table striped bordered condensed hover>
                <thead>
                <tr>
                    <th/>
                    <th
                        className="poverty-grid-header"
                    >
                        <span>Household Size</span>
                    </th>
                    <th
                        className="poverty-grid-header"
                    >
                        <span>Monthly</span>
                    </th>
                </tr>
                </thead>
                <tbody>
                {this.props.povertyData.map(PovertyRow)}
                </tbody>
            </Table>
        );
    }
}
