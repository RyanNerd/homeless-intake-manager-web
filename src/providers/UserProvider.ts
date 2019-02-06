import Frak from "./Frak";
import {UserType} from "../models/UserModel";

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

type UserPasswordResetType = {
    Id: number
    NewPassword: string
};

interface IUserResponse extends Response {
    success: boolean;
    status: number;
    data: UserType[];
}

/**
 * UserProvider Class
 */
export class UserProvider
{
    /**
     * UserProvider Constructor
     *
     * @param {string} authKey
     */
    constructor(private authKey: string)
    {
        if (authKey.length === 0) {
            throw new Error('authKey is a required argument');
        }
    }

    /**
     * Insert a new record into the User table
     *
     * @param {object} userData
     * @return {Promise<Response>}
     */
    public create(userData: UserType): Promise<IUserResponse>
    {
        let uri = BASE_URI + 'users';
        uri += '?auth_key=' + this.authKey;

        return frak.post(uri, userData)
        .then((response) =>
        {
            return response;
        })
        .catch((error) =>
        {
            return error;
        });
    }

    /**
     * Get data from the User table
     *
     * @param {string} val
     * @param {string} byField
     * @param {boolean} [isSoftSearch]
     * @return {Promise<Response>}
     */
    public read(val?: string | number, byField?: string, isSoftSearch: boolean = false): Promise<IUserResponse>
    {
        let uri = BASE_URI;
        const authKey = this.authKey;

        // Is the search by field name?
        if (byField) {
            // The REST service expects field names to be prefixed with _
            byField = '_' + byField;

            // Add endpoint to uri.
            uri += 'users?' + `${byField}=${val}`;

            // If Soft Search is requested add this to the query parameters
            if (isSoftSearch) {
                uri += '&soft_search=' + isSoftSearch.toString();
            }
            uri += '&auth_key=' + authKey;
        } else {
            if (val) {
                // Set search request endpoint to by Id.
                uri += 'users/' + `${val}`;
            } else {
                uri += 'users';
            }
            uri += '?auth_key=' + authKey;
        }

        // Return a promise using Frak to get the expected JSON payload.
        return frak.get(uri)
        .then((response) =>
        {
            return response;
        })
        .catch((error) =>
        {
            return error;
        });
    }

    /**
     * Update an existing record in the User table
     *
     * @param {object} userData
     * @return {Promise<Response>}
     */
    public update(userData: UserType): Promise<IUserResponse>
    {
        let uri = BASE_URI + 'users';
        uri += '?auth_key=' + this.authKey;

        return frak.patch(uri, userData)
        .then((response) =>
        {
            return response;
        })
        .catch((error) =>
        {
            return error;
        });
    }

    /**
     * Reset a users password
     *
     * @todo figure out correct return type
     * @param {object} credentials
     * @return {Promise<Response>}
     */
    public resetPassword(credentials: UserPasswordResetType)
    {
        let uri = BASE_URI + 'users/password-reset';
        uri += '?auth_key=' + this.authKey;
        return frak.post(uri, credentials)
        .then((response) =>
        {
            return response;
        })
        .catch((error) =>
        {
            return error;
        });
    }
}
