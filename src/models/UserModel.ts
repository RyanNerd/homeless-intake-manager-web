export const userModel =
{
    Id: 0,
    UserName: '',
    LastName: '',
    FirstName: '',
    Email: '',
    MustResetPassword: false,
    IsAdmin: false,
    Password: stringOrNull,
    AuthKey: stringOrNull,
    Active: true
};

export type UserType = Readonly<typeof userModel>;
