import Frak from "./Frak";
import {CreditType} from "../models/CreditModel";

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

interface ICreditResponse extends Response {
    success: boolean;
    status: number;
    data: CreditType;
}

/**
 * CreditProvider Class
 */
export class CreditProvider
{
    /**
     * CreditProvider Constructor
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
     * Create new record in the Credit table
     *
     * @param {object} creditData
     * @return {Promise<ICreditResponse>}
     */
    public create(creditData: CreditType): Promise<ICreditResponse>
    {
        let uri = BASE_URI + 'credits';
        uri += '?auth_key=' + this.authKey;

        return frak.post(uri, creditData)
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
     * Read data from the Credit table
     *
     * @param {string} [val]
     * @return {Promise<ICreditResponse>}
     */
    public read(val: string | number | null = null): Promise<ICreditResponse>
    {
        let uri = BASE_URI;

        // Is the search by field name?
        if (val === null) {
            // Add endpoint to uri.
            uri += 'credits';
        } else {
            // Set search request endpoint to by Id.
            uri += 'credits/' + `${val}`;
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
     * Update a record in the Credit table
     *
     * @param {object} creditData
     * @return {Promise<ICreditResponse>}
     */
    public update(creditData: CreditType)
    {
        let uri = BASE_URI + 'credits';
        uri += '?auth_key=' + this.authKey;

        return frak.patch(uri, creditData)
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
