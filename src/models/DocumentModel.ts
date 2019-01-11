import {numberOrNull, stringOrNull} from "../typings/primitives";

export const documentModel =
    {
        Id: numberOrNull,
        HouseholdId: numberOrNull,
        MemberId: numberOrNull,
        FormId: numberOrNull,
        UserId: numberOrNull,
        Title: stringOrNull,
        Notes: stringOrNull
    };

export type DocumentType = Readonly<typeof documentModel>;
