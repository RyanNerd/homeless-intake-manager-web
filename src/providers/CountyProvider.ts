import Frak from "./Frak";
import {CountyType} from "../models/CountyModel";

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH;

interface CountyResponse extends Response {
    success: boolean;
    status: number;
    data: CountyType;
}

/**
 * County Provider Class
 */
export class CountyProvider
{
    /**
     * CountyProvider
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
     * Read data from County
     *
     * @param {string} val
     * @return {Promise<Response>}
     */
    read(val: string = null): Promise<CountyResponse>
    {
        let uri = BASE_URI;

        // Is the search by field name?
        if (val === null) {
            // Add endpoint to uri.
            uri += 'counties';
        } else {
            // Set search request endpoint to by Id.
            uri += 'counties/' + `${val}`;
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
        .then((response) =>
        {
            return response.json();
        })
        .catch((error) =>
        {
            return error;
        });
    }
}
