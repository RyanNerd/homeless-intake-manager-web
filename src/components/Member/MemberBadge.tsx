import * as React from "react";
import {Component, Fragment} from "react";
import {calculateAge} from "../../utils/utilities";
import {MemberType} from "../../models/MemberModel";

const BADGE_LENGTH_MAX = 6;

interface IProps {
    memberInfo: MemberType;
    householdSize: number;
    photo: string;
}

/**
 * MemberBadge Class
 * Simple layout page for Member Info to be printed
 */
export class MemberBadge extends Component<IProps, {}>
{
    public render()
    {
        if (!this.props.memberInfo) {
            return (false);
        }

        const birthYear  = this.props.memberInfo.BirthYear  ?
                parseInt(this.props.memberInfo.BirthYear, 10).pad(4) : '';
        const birthMonth = this.props.memberInfo.BirthMonth ?
                parseInt(this.props.memberInfo.BirthMonth, 10).pad(2) : '';
        const birthDay   = this.props.memberInfo.BirthDay   ?
                parseInt(this.props.memberInfo.BirthDay, 10).pad(2) : '';
        const dob = birthYear + '-' + birthMonth + '-' + birthDay;
        const age = calculateAge(dob);
        const memberNumber = parseInt(this.props.memberInfo.Id, 10).pad(BADGE_LENGTH_MAX);
        const qrUrl = "http://bwipjs-api.metafloor.com/?bcid=code128&text=" + memberNumber + "&scale=2";

        return (
            <div style={{marginLeft: "15px", marginTop: "15px", marginBottom: "25px"}}>
                <hr/>
                <b>{this.props.memberInfo.FirstName + ' ' + this.props.memberInfo.LastName}</b>
                <p>Member # {memberNumber}</p>

                {age < 18 &&
                    <Fragment>
                        <p>Age: {age} <span style={{color: "red"}}> (Minor) </span></p>
                    </Fragment>
                }

                {this.props.householdSize &&
                    <p>Household Size: {this.props.householdSize}</p>
                }

                <img alt="" style={{paddingTop: "2px"}} src={qrUrl}/>

                {/* ---- */}
                <span style={{paddingTop: "5px"}}/>

                <img
                    alt=""
                    style={{position: "absolute", top: "23px", left: "200px"}}
                    src={this.props.photo}
                    width={200}
                    height={260}
                />
                <hr/>
            </div>
        );
    }
}
