const initialPassword: string | null = null;
const initialAuthKey: string | null = null;
export const userModel =
{
    Id: 0,
    UserName: '',
    LastName: '',
    FirstName: '',
    Email: '',
    MustResetPassword: false,
    IsAdmin: false,
    Password: initialPassword,
    AuthKey: initialAuthKey,
    Active: true
};

export type UserType = Readonly<typeof userModel>