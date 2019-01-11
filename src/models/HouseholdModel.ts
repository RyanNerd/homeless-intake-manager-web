import {numberOrNull, stringOrNull} from "../typings/primitives";

const stateDefault = process.env.STATE_DEFAULT as string;
const countyDefault = process.env.COUNTY_DEFAULT as string;

export const householdModel =
    {
        Id: numberOrNull,
        MemberId: numberOrNull,
        UserId: numberOrNull,
        HouseholdName: '',
        Address: stringOrNull,
        PO: stringOrNull,
        City: stringOrNull,
        State: stateDefault,
        Zip: stringOrNull,
        County: countyDefault,
        Phone: stringOrNull,
        Rent: numberOrNull,
        RentSubsidized: false,
        Own: false,
        WithFriendsFamily: false,
        Homeless: false,
        FoodStamps: false,
        WIC: false,
        FreeSchoolLunch: false,
        Medicaid: false,
        VehicleMake: stringOrNull,
        VehicleModel: stringOrNull,
        VehicleYear: stringOrNull,
        FamilyType: stringOrNull,
        IsDemo: false
    };

export type HouseholdType = Readonly<typeof householdModel>;
