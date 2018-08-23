const numberOrNull: number | null = null;

export const povertyModel =
{
    Id: numberOrNull,
    Monthly: numberOrNull
};

export type PovertyType = Readonly<typeof povertyModel>