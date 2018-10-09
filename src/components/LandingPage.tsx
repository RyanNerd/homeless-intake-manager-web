import * as React from "react";
import {Component, SyntheticEvent} from "react";
import { Fragment } from "react";
import {StoreConsumer} from "./StoreContext";
import {
    Col,
    Row,
    Tab,
    Nav,
    NavItem,
    PageHeader, TabContainer
} from 'react-bootstrap';
import {AdminPage} from "./Admin/AdminPage";
import {LoginPage} from "./Login/LoginPage";
import {IntakePage} from "./Intake/IntakePage";
import {SearchPage} from "./Search/SearchPage";
import {ToasterAlert} from "./ToasterAlert";
import {HouseholdPage} from "./Household/HouseholdPage";
import { ContextType } from "./StoreContext";
import pantry from "./../images/pantry.png";

interface Props {
    context?: ContextType;
    isChrome: boolean;
}

const organizationName = process.env.ORGANIZATION_NAME;

/**
 * 𐐃𐑊 𐐷𐐳𐑉 𐐽𐐬𐐩𐑅𐑆 𐐸𐐰𐑂 𐐿𐐲𐑌𐑅𐐹𐐴𐐲𐑉𐐼 𐐻𐐭 𐐺𐑉𐐮𐑍 𐐷𐐭 𐐻𐐭 𐑄𐐮𐑅 𐑂𐐯𐑉𐐨 𐑋𐐬𐑋𐐲𐑌𐐻 𐐮𐑌 𐐻𐐴𐑋.
 */
const notChromeAlert =(
    <ToasterAlert timeout={15000} bsStyle={"warning"} style={{textAlign: "center"}}>
        <p>Chrome browser is recommended</p>
        <p>You are using a different browser and may experience unexpected behavior</p>
    </ToasterAlert>
);

export const LandingPage = (props: Props) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <LandingPageBase
                context={context}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * LandingPage Class
 *
 * TODO: Report tab does nothing -- it really should do something.
 * TODO: Make barcode genration internal instead of an external API call: https://github.com/metafloor/bwip-js#browser-usage
 * TODO: Allow users that are admins to physically delete some records (intake, member, household).
 */
class LandingPageBase extends Component<Props, {}>
{
    state = {
        key: 'login' // Starting tab
    };

    /**
     * Handle tab changed event
     * @param {SyntheticEvent} key
     *
     * @see https://react-bootstrap.github.io/components/tabs/#tabs-props
     */
    handleSelect(key: SyntheticEvent<TabContainer>)
    {
        this.setState({key: key});
    }

    render()
    {
        const context = this.props.context;

        return (
            <Fragment>
                <PageHeader style={{textAlign: "center"}}>{organizationName} Intake</PageHeader>

                {!context.state.currentUser &&
                    <div style={{textAlign: "center", paddingBottom: "10px"}}><img src={pantry} height={100} width={450}/></div>
                }

                {/* If the browser being used is NOT Chrome then alert the user that there may be issues */}
                {!this.props.isChrome && notChromeAlert}

                {/* Show the Login tab container until the user is logged in then show the 'main' tab container */}
                <Fragment>
                    {!context.state.currentUser || !context.state.currentUser.AuthKey ? (
                        <Tab.Container
                            id="sign-in-tab"
                            defaultActiveKey="login"
                            activeKey={this.state.key}
                            onSelect={(key: SyntheticEvent<TabContainer>) => this.handleSelect(key)}
                        >
                            <Row>
                                <Col sm={12}>
                                    <Nav bsStyle="tabs">
                                        <NavItem
                                            eventKey="login"
                                        >
                                            Login
                                        </NavItem>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation style={{marginTop: "10px"}}>
                                        <Tab.Pane eventKey="login">
                                            <LoginPage onSignedIn={()=>this.setState({key: 'search'})}/>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>

                    ) : (

                        <Tab.Container
                            id="main-tab"
                            defaultActiveKey="search"
                            activeKey={this.state.key}
                            onSelect={(key: SyntheticEvent<TabContainer>) => this.handleSelect(key)}
                        >
                            <Row>
                                <Col sm={12}>
                                    <Nav bsStyle="tabs">
                                        <NavItem
                                            eventKey="search"
                                        >
                                            Search
                                        </NavItem>

                                        <NavItem
                                            eventKey="household"
                                        >
                                            Household
                                        </NavItem>

                                        <NavItem
                                            eventKey="intake"
                                            disabled={!context.state.currentMember}
                                        >
                                            Pantry Intake
                                        </NavItem>

                                        <NavItem
                                            eventKey="reports"
                                            disabled={!context.state.currentUser.IsAdmin}
                                        >
                                            Reports
                                        </NavItem>

                                        <NavItem
                                            eventKey="admin"
                                            disabled={!context.state.currentUser.IsAdmin}
                                        >
                                            Admin
                                        </NavItem>
                                    </Nav>
                                </Col>

                                <Col sm={12}>
                                    <Tab.Content animation style={{marginTop: "10px"}}>
                                        <Tab.Pane eventKey="search">
                                            <SearchPage/>
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="intake">
                                            {context.state.currentMember &&
                                                <IntakePage/>
                                            }
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="household">
                                            <HouseholdPage/>
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="reports">
                                            <p>Reports Placeholder</p>
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="admin">
                                            <AdminPage/>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
                    )}

                    {context.state.currentUser &&
                        <p style={{fontSize: "x-small"}}><span style={{fontWeight: "bold"}}>Staff:</span> {context.state.currentUser.LastName}, {context.state.currentUser.FirstName}</p>
                    }
                </Fragment>

                <p style={{fontSize: "xx-small", paddingTop: "15px"}}>
                    © 2018 Digital Codex <a href={"https://github.com/RyanNerd/pantry-intake-web/issues/new"} target="_blank" rel="noreferrer">Report issues</a>
                </p>
            </Fragment>
        )
    }
}
