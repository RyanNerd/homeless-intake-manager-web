import {numberOrNull, stringOrNull} from "../typings/primitives";

const today = new Date();

export const intakeModel =
{
    Id: numberOrNull,
    MemberId: numberOrNull,
    HouseholdId: numberOrNull,
    UserId: numberOrNull,
    SignatureId: numberOrNull,
    FoodBox: false,
    Perishable: false,
    Camper: false,
    Diaper: false,
    Notes: stringOrNull,
    FoodBoxWeight: "0.00",
    PerishableWeight: "0.00",
    HouseholdSize: 0,
    IntakeYear: today.getFullYear(),
    IntakeMonth: today.getMonth() + 1,
    IntakeDay: today.getDate()
};
export type IntakeType = Readonly<typeof intakeModel>;
