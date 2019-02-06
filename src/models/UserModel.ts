import {numberOrNull, stringOrNull} from "../typings/primitives";

export const userModel =
{
    Id: numberOrNull,
    UserName: '',
    LastName: '',
    FirstName: '',
    Email: '',
    MustResetPassword: true,
    IsAdmin: false,
    Password: stringOrNull,
    AuthKey: stringOrNull,
    Active: true
};

export type UserType = Readonly<typeof userModel>;
