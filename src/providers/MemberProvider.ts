import Frak from "./Frak";
import {MemberType} from "../models/MemberModel";

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

interface MemberResponse extends Response {
    success: boolean;
    status: number;
    data: MemberType[];
}

/**
 * MemberProvider Class
 */
export class MemberProvider
{
    /**
     * MemberProvider Constructor
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
     * Insert a new record into the Member table
     *
     * @param {object} memberData
     * @return {Promise<Response>}
     */
    create(memberData: MemberType): Promise<MemberResponse>
    {
        let uri = BASE_URI + 'members';
        uri += '?auth_key=' + this.authKey;

        return frak.post(uri, memberData)
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
     * Get data from the Member table
     *
     * @param {string} val
     * @param {string} byField
     * @param {boolean} [isSoftSearch]
     * @return {Promise<Response>}
     */
    read(val: string | number, byField?: string, isSoftSearch: boolean = false): Promise<MemberResponse>
    {
        let uri = BASE_URI;
        let authKey = this.authKey;

        // Is the search by field name?
        if (byField)
        {
            // The REST service expects field names to be prefixed with _
            byField = '_' + byField;

            // Add endpoint to uri.
            uri += 'members?' + `${byField}=${val}`;

            // If Soft Search is requested add this to the query parameters
            if (isSoftSearch) {
                uri += '&soft_search=' + isSoftSearch.toString();
            }

            uri += '&auth_key=' + authKey;
        } else {
            // Set search request endpoint to by Id.
            uri += 'members/' + `${val}`;
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
     * Update a record in the Member table
     *
     * @param {object} memberData
     * @return {Promise<Response>}
     */
    update(memberData: MemberType): Promise<MemberResponse>
    {
        let uri = BASE_URI + 'members';
        uri += '?auth_key=' + this.authKey;

        return frak.patch(uri, memberData)
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
