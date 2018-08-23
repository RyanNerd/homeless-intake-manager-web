const today = new Date();
const numberOrNull: number | null = null;
const stringOrNull: string | null = null;

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
    FoodBoxWeight: 0,
    PerishableWeight: 0,
    HouseholdSize: 0,
    IntakeYear: today.getFullYear(),
    IntakeMonth: today.getMonth() + 1,
    IntakeDay: today.getDate()
};
export type IntakeType = Readonly<typeof intakeModel>