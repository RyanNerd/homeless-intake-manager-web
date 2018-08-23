import * as React from "react";
import { Component } from "react";
import { ContextType} from "../StoreContext";
import {StoreConsumer} from "../StoreContext";
import {
        Tab,
        Row,
        Col,
        Nav,
        NavItem
} from 'react-bootstrap';
import {UserPage} from "../User/UserPage";
import {PovertyPage} from "../Poverty/PovertyPage";
import {SyntheticEvent} from "react";

interface AdminPageProps {
    context: ContextType;
}

const initalState = { key: 'users'};

type State = Readonly<typeof initalState>

export const AdminPage = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <AdminPageBase
                context={context}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * AdminPage Class - Tab Container
 */
class AdminPageBase extends Component<AdminPageProps, State>
{
    readonly state: State = initalState;

    /**
     * Handle tab changed event
     *
     * @param {string} key - Technically this is always a string for us, but react-bootstrap allows any
     * @param {SyntheticEvent} [e]
     */
    handleSelect(key: any, e?: SyntheticEvent<any>)
    {
        this.setState({key: key});
    }

    render()
    {
        return(
            <Tab.Container
                id="admin-tab-page"
                defaultActiveKey="users"
                activeKey={this.state.key}
                onSelect={(key)=>this.handleSelect(key)}
                style={{marginTop: "25px", marginLeft: "15px", marginBottom: "5px", marginRight: "15px"}}
            >
                <Row>
                    <Col sm={12}>
                        <Nav bsStyle="tabs">
                            <NavItem
                                eventKey="users"
                            >
                                Users
                            </NavItem>

                            <NavItem
                                eventKey="poverty"
                                disabled={false}
                            >
                                Poverty Table
                            </NavItem>

                            <NavItem
                                eventKey="translations"
                                disabled={true}
                            >
                                Language Translations
                            </NavItem>
                        </Nav>
                    </Col>

                    <Col sm={12}>
                        <Tab.Content animation style={{marginTop: "10px"}}>
                            <Tab.Pane eventKey="users">
                                <UserPage/>
                            </Tab.Pane>

                            <Tab.Pane eventKey="poverty">
                                <PovertyPage/>
                            </Tab.Pane>

                            <Tab.Pane eventKey="translations">
                                <p>Translations Placeholder</p>
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        )
    }
}