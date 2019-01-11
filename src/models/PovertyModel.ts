import {numberOrNull} from "../typings/primitives";

export const povertyModel =
{
    Id: numberOrNull,
    UserId: numberOrNull,
    Monthly: numberOrNull
};

export type PovertyType = Readonly<typeof povertyModel>;
