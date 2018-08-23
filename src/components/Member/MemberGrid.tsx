import * as React from "react";
import {Component, MouseEvent} from "react";
import {
        Table,
        Button
} from 'react-bootstrap';
import {sortByColumnName} from "../../utils/utilities";
import {MemberType} from "../../models/MemberModel";

const BADGE_LENGTH_MAX = 6;

interface MemberGridProps {
    onMemberSelected: Function
    members: MemberType[]
}

const initialMembers: MemberType[] | null = null;
const initialState = {
        sortDirection: 1,
        members: initialMembers,
        sortBy: 'LastName',
        arrow: "↓"
};
type State = Readonly<typeof initialState>

/**
 * MemberGrid class
 */
export class MemberGrid extends Component<MemberGridProps, State>
{
    readonly state: State = initialState;

    /**
     * Lifecycle hook - componentDidUpdate
     *
     * @param {object} prevProps
     */
    componentDidUpdate(prevProps: MemberGridProps)
    {
        // Is this the initial assignment of member data?
        if (this.state.members === null && this.props.members) {
            this.setState({members: sortByColumnName(this.props.members, this.state.sortBy) as MemberType[]});
        } else {
            // Is the the members property not empty?
            if (this.props.members) {
                // Another reason to hate JS.
                // There's not a native method to compare an array of objects so we have a hack via JSON.stringify:
                const prevMembers = JSON.stringify(prevProps.members);
                const currentMembers = JSON.stringify(this.props.members);

                // Is there a change from the previous members array to the current members array?
                if (prevMembers !== currentMembers) {
                    this.setState({members: sortByColumnName(this.props.members, this.state.sortBy) as MemberType[]});
                }
            }
        }
    }

    /**
     * Handle when a member is selected from the member grid
     *
     * @param {Event} e
     * @param {int} id
     */
    handleMemberSelected(e: MouseEvent<Button>, id: number)
    {
        e.preventDefault();

        this.props.onMemberSelected(id);
    }

    /**
     * Handle when user has clicked on a header to sort by that header
     *
     * @param {Event} e
     * @param {string} columnName Name of the column in the array to sort by.
     */
    handleSortBy(e: MouseEvent<HTMLTableHeaderCellElement>, columnName: string)
    {
        e.preventDefault();

        // Cache the current sort direction.
        let sortDirection = this.state.sortDirection;

        // Is a new column selected? If so then re-sort the array, otherwise reverse the array.
        if (this.state.sortBy !== columnName) {
            this.setState({members: sortByColumnName(this.state.members, columnName) as MemberType[], sortBy: columnName, sortDirection: 1, arrow: "↑"});
        } else {
            sortDirection = 1 - sortDirection;
            this.setState({members: this.state.members.reverse(), sortDirection: sortDirection, arrow: sortDirection ? "↑" : "↓"});
        }
    }

    render()
    {
        const MemberRow = (member: MemberType) =>
        {
            let memberId = parseInt(member.Id).pad(BADGE_LENGTH_MAX);
            const birthYear  = member.BirthYear  ? parseInt(member.BirthYear).pad(4) : '';
            const birthMonth = member.BirthMonth ? parseInt(member.BirthMonth).pad(2) : '';
            const birthDay   = member.BirthDay   ? parseInt(member.BirthDay).pad(2) : '';
            const dob = birthYear + '-' + birthMonth + '-' + birthDay;

            let rowClassName="member-grid-row";
            let buttonClassName="member-grid-button";

            if (!member.Active) {
                rowClassName="member-grid-row-inactive";
                buttonClassName="member-grid-button-inactive";
            }

            return (
                <tr
                    key={'member-grid-row-' + member.Id}
                    className={rowClassName}
                    id={'member-grid-row-' + member.Id}
                >
                    <td>
                        <Button
                            id={"member-grid-button-" + member.Id}
                            className={buttonClassName}
                            onClick={(e: MouseEvent<Button>)=>{this.handleMemberSelected(e, member.Id)}}
                        >
                            Select
                        </Button>
                    </td>
                    <td>{memberId}</td>
                    <td>{member.FirstName}</td>
                    <td>{member.LastName}</td>
                    <td>{dob}</td>
                </tr>
            )
        };

        if (!this.state.members) {
            return (false);
        }

        return (
            <Table striped bordered condensed hover>
                <thead>
                    <tr>
                        <th/>
                        <th
                            onClick={(e)=>this.handleSortBy(e, 'Id')}
                            className="member-grid-header"
                        >
                            {this.state.sortBy === 'Id' ?
                                (<span style={{color: "blue"}}>Member # {this.state.arrow}</span>) :
                                (<span>Member #</span>)
                            }
                        </th>
                        <th
                            onClick={(e)=>this.handleSortBy(e, 'FirstName')}
                            className="member-grid-header"
                        >
                            {this.state.sortBy === 'FirstName' ?
                                (<span style={{color: "blue"}}>First Name {this.state.arrow}</span>) :
                                (<span>First Name</span>)
                            }
                        </th>
                        <th
                            onClick={(e)=>this.handleSortBy(e, 'LastName')}
                            className="member-grid-header"
                        >
                            {this.state.sortBy === 'LastName' ?
                                (<span style={{color: "blue"}}>Last Name {this.state.arrow}</span>) :
                                (<span>Last Name</span>)
                            }
                        </th>
                        <th
                            onClick={(e)=>this.handleSortBy(e, 'BirthYear')}
                            className="member-grid-header"
                        >
                            {this.state.sortBy === 'BirthYear' ?
                                (<span style={{color: "blue"}}>DOB {this.state.arrow}</span>) :
                                (<span>DOB</span>)
                            }
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.members.map(MemberRow)}
                </tbody>
            </Table>
        );
    }
}
