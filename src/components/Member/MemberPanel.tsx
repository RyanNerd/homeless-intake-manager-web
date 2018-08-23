import * as React from "react";
import {Component} from "react";
import {ContextType, StoreConsumer} from "../StoreContext";
import {
    Button,
    Col,
    Panel
} from 'react-bootstrap';
import {ImageDrop} from "../ImageDrop";
import {MemberProvider} from "../../providers/MemberProvider";
import {StorageProvider} from "../../providers/StorageProvider";
import {
    base64MimeType,
    calculateAge
} from "../../utils/utilities";
import {MemberType} from "../../models/MemberModel";
import {StorageType} from "../../models/StorageModel";

const BADGE_LENGTH_MAX = 6;

interface MemberPanelProps {
    onMemberImageChanged: Function
    storageProvider: StorageProvider
    memberProvider: MemberProvider
    readOnly: boolean
    children: any
    context: ContextType
}

const initialMemberInfo: MemberType = null;
const initialPhoto: string = null;
const initialState = {
    memberInfo: initialMemberInfo,
    photo: initialPhoto
};
type State = Readonly<typeof initialState>

export const MemberPanel = (props?: any) => (
    <StoreConsumer>
        {(context: ContextType) =>
            <MemberPanelBase
                context={context}
                storageProvider={new StorageProvider(context.state.currentUser.AuthKey)}
                memberProvider={new MemberProvider(context.state.currentUser.AuthKey)}
                {...props}
            />
        }
    </StoreConsumer>
);

/**
 * MemberPanel Class
 */
class MemberPanelBase extends Component<MemberPanelProps, State>
{
    readonly state: State = initialState;

    /**
     * Lifecycle Hook - componentDidMount
     */
    componentDidMount()
    {
        // Subscribe to store.context.currentMember state changes
        this.currentMemberUpdated = this.currentMemberUpdated.bind(this);
        this.props.context.subscribe('currentMember', this.currentMemberUpdated);
    }

    /**
     * Error handler
     *
     * @param {string | object} error
     */
    onError(error: object | string)
    {
        this.props.context.methods.setError(error);
    }

    /**
     * Fires when the currentMember changes
     *
     * @param {object} memberInfo
     */
    currentMemberUpdated(memberInfo: MemberType)
    {
        this.setState({memberInfo: memberInfo});
        if (memberInfo && memberInfo.PhotoId) {
            this.props.storageProvider.read(memberInfo.PhotoId)
            .then((response)=>
            {
                if (response.success) {
                    return response.data.Content;
                } else {
                    throw response;
                }
            })
            .then((content)=>
            {
                this.props.context.methods.setCurrentMemberPhoto(content);
            })
            .catch((error)=>
            {
                this.onError(error);
            });
        } else {
            this.props.context.methods.setCurrentMemberPhoto(null);
        }
    }

    /**
     * Fires when the image for the member has changed.
     *
     * @param {string} img DataURL for the new image.
     */
    onImageChanged(img: string)
    {
        let memberInfo = {...this.state.memberInfo};
        let mimeType = base64MimeType(img);
        let photoStorage = {Id: memberInfo.PhotoId, Content: img, MimeType: mimeType} as StorageType;

        // Do we have an existing record for Member.PhotoId?
        if (photoStorage.Id) {
            // Storage changes to existing records are more like a PUT operations but we use CRUD so it's an update.
            this.props.storageProvider.update(photoStorage)
            .then((response) =>
            {
                if (response.success) {
                    this.currentMemberUpdated(memberInfo);
                } else {
                    this.onError(response);
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        } else {
            // We need to create a new Storage record and then update the Member record with the PhotoId.
            this.props.storageProvider.create(photoStorage)
            .then((response) =>
            {
                if (response.success) {
                    memberInfo.PhotoId = response.data.Id;
                    this.props.memberProvider.update(memberInfo)
                    .then((response)=>
                    {
                        if (response.success) {
                            this.currentMemberUpdated(memberInfo);
                        } else {
                            this.onError(response);
                        }
                    })
                    .catch((error)=>
                    {
                        this.onError(error);
                    })
                }
            })
            .catch((error) =>
            {
                this.onError(error);
            });
        }
    }

    render()
    {
        if (!this.state.memberInfo) {
            return (false);
        }

        const birthYear  = this.state.memberInfo.BirthYear  ? parseInt(this.state.memberInfo.BirthYear).pad(4) : '';
        const birthMonth = this.state.memberInfo.BirthMonth ? parseInt(this.state.memberInfo.BirthMonth).pad(2) : '';
        const birthDay   = this.state.memberInfo.BirthDay   ? parseInt(this.state.memberInfo.BirthDay).pad(2) : '';
        const dob = birthYear + '-' + birthMonth + '-' + birthDay;
        const age = calculateAge(dob);
        const context = this.props.context;
        const memberNumber = parseInt(this.state.memberInfo.Id).pad(BADGE_LENGTH_MAX);
        const qrUrl = "http://bwipjs-api.metafloor.com/?bcid=code128&text=" + memberNumber + "&scale=1";

        return (
            <Panel bsStyle="primary">
                <Panel.Heading>
                    {context.state.currentHousehold.IsDemo && <Button disabled={true} bsStyle="danger" style={{marginRight: "15px", cursor: "default"}}>DEMO</Button>}
                    {this.state.memberInfo.FirstName + ' ' + this.state.memberInfo.LastName}
                    {!this.state.memberInfo.Active && <span style={{color: "red", paddingLeft: "5px"}}>(INACTIVE)</span>}
                </Panel.Heading>
                <Panel.Body>
                    <Col sm={5}>
                        <p>Member # {memberNumber}</p>
                        <p>DOB: {dob}</p>
                        <p>
                            Age: {age}
                            {age < 18 &&
                                <span style={{color: "red"}}> (Minor) </span>
                            }
                        </p>
                        {context.state.householdSize &&
                            <p>Household Size: {context.state.householdSize}</p>
                        }
                        <img src={qrUrl}/>
                    </Col>

                    <Col sm={5}>
                        <ImageDrop
                            src={context.state.currentMemberPhoto}
                            width={200}
                            height={275}
                            readOnly={this.props.readOnly}
                            onImageChanged={(img: string)=>this.onImageChanged(img)}
                        />
                    </Col>

                </Panel.Body>
                {this.props.children}
            </Panel>
        )
    }
}
