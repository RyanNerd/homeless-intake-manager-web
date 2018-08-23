import Frak from "./Frak";
import {HouseholdType} from "../models/HouseholdModel";

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

interface HouseholdResponse extends Response {
    success: boolean;
    data: HouseholdType;
}

interface MemberCountResponse extends Response {
    success: boolean;
    data: {Count: number}
}

/**
 * HouseholdProvider Class
 */
export class HouseholdProvider
{
    /**
     * HouseholdProvider Constructor
     *
     * @param {string} authKey
     */
    constructor(private authKey:string)
    {
        if (authKey.length === 0) {
             throw new Error('authKey is a required argument');
        }
    }

    /**
     * Create new record in the Household table
     *
     * @param {object} householdData
     * @return {Promise<Response>}
     */
    create(householdData: HouseholdType)
    {
        let uri = BASE_URI + 'households';
        uri += '?auth_key=' + this.authKey;

        return frak.post(uri, householdData)
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
     * Read data from the Household table
     *
     * @param {string} [val]
     * @return {Promise<Response>}
     */
    read(val: string | number | null = null): Promise<HouseholdResponse>
    {
        let uri = BASE_URI;

        // Is the search by field name?
        if (val === null) {
            // Add endpoint to uri.
            uri += 'households';
        } else {
            // Set search request endpoint to by Id.
            uri += 'households/' + `${val}`;
        }

        uri += '?auth_key=' + this.authKey;

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
     * Update a record in the Household table
     *
     * @param {object} householdData
     * @return {Promise<Response>}
     */
    update(householdData: HouseholdType)
    {
        let uri = BASE_URI + 'households';
        uri += '?auth_key=' + this.authKey;

        return frak.patch(uri, householdData)
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
     * Get the number of members in a household.
     * 
     * @param {int} householdId
     * @return {Promise<Response>}
     */
    memberCount(householdId: string | number): Promise<Number>
    {
        let uri = BASE_URI + 'household-member-count/' + `${householdId}`;
        uri += '?auth_key=' + this.authKey;

        return frak.get(uri)
        .then((response: MemberCountResponse)=>
        {
            if (response.success) {
                return response.data.Count;
            } else {
                return null;
            }
        })
        .catch((error)=>
        {
            return error;
        })
    }
}
