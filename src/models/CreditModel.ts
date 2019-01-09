export const creditModel =
    {
        Id: numberOrNull,
        MemberId: numberOrNull,
        UserId: numberOrNull,
        Event: stringOrNull,
        Plus: numberOrNull,
        Minus: numberOrNull,
        Created: stringOrNull,
        Changed: stringOrNull
    };

export type DocumentType = Readonly<typeof creditModel>;
