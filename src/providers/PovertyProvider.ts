import Frak from "./Frak";
import {PovertyType} from "../models/PovertyModel";

interface IPovertyResponse extends Response {
    success: boolean;
    status: number;
    data: PovertyType[];
}

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak: Frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

/**
 * PovertyProvider Class
 */
export class PovertyProvider
{
    /**
     * PovertyProvider
     *
     * @constructor
     * @param {string} authKey
     */
    constructor(private authKey: string)
    {
        if (authKey.length === 0) {
            throw new Error('authKey is a required argument');
        }
    }

    /**
     * Insert a new record into the Poverty table
     *
     * @param {object} povertyData
     * @return {Promise<Response>}
     */
    public create(povertyData: PovertyType)
    {
        let uri = BASE_URI + 'poverty';
        uri += '?auth_key=' + this.authKey;

        return frak.post(uri, povertyData)
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
     * Get data from the Poverty table
     *
     * @param {string} [val]
     * @return {Promise<Response>}
     */
    public read(val: string | number = null): Promise<IPovertyResponse>
    {
        let uri = BASE_URI;

        // Is the search by field name?
        if (val === null) {
            // Add endpoint to uri.
            uri += 'poverty';
        } else {
            // Set search request endpoint to by Id.
            uri += 'poverty/' + `${val}`;
        }
        uri += '?auth_key=' + this.authKey;

        // Return a promise using Frak to get the expected JSON payload.
        return frak.get(uri, null, false)
        .then((response) =>
        {
            if (response.ok) {
                return response;
            } else {
                throw response;
            }
        })
        .then((response: Response) =>
        {
            return response.json();
        })
        .catch((error: Error | object) =>
        {
            return error;
        });
    }

    /**
     * Update an existing record in the Poverty table
     *
     * @param {object} povertyData
     * @return {Promise<Response>}
     */
    public update(povertyData: PovertyType): Promise<IPovertyResponse>
    {
        let uri = BASE_URI + 'poverty';
        uri += '?auth_key=' + this.authKey;

        return frak.patch(uri, povertyData)
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
