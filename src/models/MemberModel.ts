import {numberOrNull, stringOrNull} from "../typings/primitives";

export const memberModel =
{
    Id: numberOrNull,
    HouseholdId: numberOrNull,
    UserId: numberOrNull,
    LastName: stringOrNull,
    MiddleInitial: stringOrNull,
    FirstName: stringOrNull,
    BirthYear: stringOrNull,
    BirthMonth: stringOrNull,
    BirthDay: stringOrNull,
    Email: stringOrNull,
    Gender: stringOrNull,
    Disability: false,
    Veteran: false,
    Race: 'W',
    Hispanic: false,
    Education: stringOrNull,
    EducationAssociate: false,
    EducationBachelors: false,
    CanWork: false,
    Employed: false,
    IncomeType: "",
    IncomeTotal: 0,
    IncomeSSI: false,
    IncomeSocialSecurity: false,
    IncomeChildSupport: false,
    IncomeOther: numberOrNull,
    HealthInsurance: false,
    HealthInsuranceMedicaid: false,
    HealthInsurancePrivate: false,
    HealthInsuranceMedicare: false,
    HealthInsuranceCHIP: false,
    HealthInsurancePCN: false,
    PhotoId: numberOrNull,
    DL: stringOrNull,
    SSN: stringOrNull,
    Active: true
};

export type MemberType = Readonly<typeof memberModel>;

