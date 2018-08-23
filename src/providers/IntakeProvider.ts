import Frak from "./Frak";
import {IntakeType} from "../models/IntakeModel";

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

type IntakeResponse = {
    success: boolean;
    status: number;
    data: IntakeType[];
}

/**
 * IntakeProvider Class
 */
export class IntakeProvider
{
    /**
     * IntakeProvider Constructor
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
     * Insert a record into the Intake table
     *
     * @param {object} intakeData
     * @return {Promise<Response>}
     */
    create(intakeData: IntakeType)
    {
        let uri = BASE_URI + 'intakes';

        uri += '?auth_key=' + this.authKey;


        return frak.post(uri, intakeData)
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
     * Read data from the Intake table
     *
     * @param {string} val
     * @param {string} byField
     * @param {boolean} [isSoftSearch]
     * @return {Promise<Response>}
     */
    read(val: string | number, byField: string, isSoftSearch: boolean = false): Promise<IntakeResponse>
    {
        let uri = BASE_URI;

        // Is the search by field name?
        if (byField)
        {
            // The REST service expects field names to be prefixed with _
            byField = '_' + byField;

            // Add endpoint to uri.
            uri += 'intakes?' + `${byField}=${val}`;

            // If Soft Search is requested add this to the query parameters
            if (isSoftSearch)
            {
                uri += '&soft_search=' + isSoftSearch.toString();
            }

            uri += '&auth_key=' + this.authKey;
        } else {
            // Set search request endpoint to by Id.
            uri += 'intakes/' + `${val}`;
            uri += '?auth_key=' + this.authKey;
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
     * Update a record in the Intake table
     *
     * @param {object} intakeData
     * @return {Promise<Response>}
     */
    update(intakeData: IntakeType): Promise<IntakeResponse>
    {
    let uri = BASE_URI + 'intakes';
    uri += '?auth_key=' + this.authKey;

    return frak.patch(uri, intakeData)
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
