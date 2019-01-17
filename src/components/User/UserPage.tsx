import * as React from "react";
import {Component, MouseEvent} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {Button} from 'react-bootstrap';
import {UserGrid} from "./UserGrid";
import {UserEdit} from "./UserEdit";
import {userModel, UserType} from "../../models/UserModel";
import {UserProvider} from "../../providers/UserProvider";

interface IProps {
    context: ContextType;
    userProvider: UserProvider;
}

const userInfoOrNull: UserType | null = null;
const usersOrNull: UserType[] | null = null;
const initialState = {
    showUserEdit: false,
    userInfo: userInfoOrNull,
    users: usersOrNull
};
type State = Readonly<typeof initialState>;

export const UserPage = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <UserPageBase
                context={context}
                userProvider={new UserProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * UserPage Class
 */
class UserPageBase extends Component<IProps, State>
{
    public readonly state: State = initialState;

    /**
     * Lifecycle hook - componentDidMount
     */
    public componentDidMount()
    {
        const context = this.props.context;
        if (context.state.currentUser && context.state.currentUser.IsAdmin) {
            this.populateUserGrid();
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
     * Fires when a user is selected.
     * Bring up UserEdit modal.
     *
     * @param {UserType} user
     */
    private onUserSelected(user: UserType)
    {
        // user should be passed by value to avoid looking like cancelled updates actually got applied.
        const userInfo = {...user, Password: null} as UserType;
        this.setState({userInfo: userInfo, showUserEdit: true});
    }

    /**
     * Fires when the Add New User button is clicked.
     * Bring up UserEdit modal
     *
     * @param {MouseEvent} e
     */
    private addUser(e: MouseEvent<Button>)
    {
        e.preventDefault();

        // Set the user record to an empty userModel and bring up the UserEdit modal form.
        this.setState({userInfo: userModel, showUserEdit: true});
    }

    /**
     * Called when the UserGrid needs a refresh.
     */
    private populateUserGrid()
    {
        this.props.userProvider.read()
        .then((response) =>
        {
            if (response.success) {
                this.setState({users: response.data});
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
     * Fires when the UserEdit modal closes (either by a save or cancel)
     *
     * @param {boolean} shouldRefresh True if changes were made in the modal and the grid should refresh
     */
    private handleUserEditClose(shouldRefresh: boolean)
    {
        this.setState({showUserEdit: false});

        if (shouldRefresh) {
            this.populateUserGrid();
        }
    }

    public render()
    {
        return(
            <div style={{marginTop: "25px", marginLeft: "15px", marginBottom: "25px", marginRight: "15px"}}>

                {this.state.users &&
                    <UserGrid
                        users={this.state.users}
                        onUserSelected={(user: UserType) => this.onUserSelected(user)}
                    />
                }

                <br/>

                <Button onClick={(e) => this.addUser(e)}
                >
                    Add User
                </Button>

                {/* UserEdit Modal */}
                <UserEdit
                    userProvider={this.props.userProvider}
                    show={this.state.showUserEdit}
                    onHide={(shouldRefresh: boolean) => this.handleUserEditClose(shouldRefresh)}
                    keyboard={true}
                    userInfo={this.state.userInfo}
                />
            </div>
        );
    }
}
