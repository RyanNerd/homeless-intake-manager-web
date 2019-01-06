import * as React from "react";
import {Component, MouseEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
        Table,
        Button
} from 'react-bootstrap';
import {UserType} from "../../models/UserModel";

interface IProps {
    context?: ContextType;
    onUserSelected: (userInfo: UserType) => void;
    users: UserType[];
}

export const UserGrid = (props: IProps) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <UserGridBase
                context={context}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * UserGrid Class
 */
class UserGridBase extends Component<IProps, {}>
{
    /**
     * Handle when a user is selected from the grid
     *
     * @param {MouseEvent} e
     * @param {UserType} user
     */
    private handleUserSelected(e: MouseEvent<Button>, user: UserType)
    {
        e.preventDefault();
        this.props.onUserSelected(user);
    }

    public render()
    {
        const UserRow = (user: UserType) =>
        {
            let rowClassName = "user-grid-row";
            let buttonClassName = "user-grid-button";

            if (!user.Active) {
                rowClassName = "user-grid-row-inactive";
                buttonClassName = "user-grid-button-inactive";
            }

            return (
                <tr
                    key={'user-grid-row-' + user.Id}
                    className={rowClassName}
                    id={'user-grid-row-' + user.Id}
                >
                    <td>
                        <Button
                            id={"user-grid-button-" + user.Id}
                            className={buttonClassName}
                            onClick={(e: MouseEvent<Button>) => {this.handleUserSelected(e, user); }}
                        >
                            Select
                        </Button>
                    </td>
                    <td>{user.FirstName}</td>
                    <td>{user.LastName}</td>
                    <td>{user.Email}</td>
                    <td>{user.UserName}</td>
                </tr>
            );
        };

        if (!this.props.users) {
            return (false);
        }

        return (
            <Table striped bordered condensed hover>
                <thead>
                <tr>
                    <th/>
                    <th
                        className="user-grid-header"
                    >
                        <span>First Name</span>
                    </th>
                    <th
                        className="user-grid-header"
                    >
                        <span>Last Name</span>
                    </th>
                    <th
                        className="user-grid-header"
                    >
                        <span>Email</span>
                    </th>
                    <th
                        className="user-grid-header"
                    >
                        <span>Nick Name</span>
                    </th>
                </tr>
                </thead>
                <tbody>
                    {this.props.users.map(UserRow)}
                </tbody>
            </Table>
        );
    }
}
