import Frak from "./Frak";
import {StorageType} from "../models/StorageModel";

type StorageResponse = {
    success: boolean;
    data: StorageType;
}

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

/**
 * StorageProvider Class
 */
export class StorageProvider
{
    /**
     * StorageProvider Constructor
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
     * Insert new record into Storage table
     *
     * @param {object} storageData
     * @return {Promise<Response>}
     */
    create(storageData: StorageType): Promise<StorageResponse>
    {
        let uri = BASE_URI + 'storage' + '?auth_key=' + this.authKey;
        return frak.post(uri, storageData)
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
     * Get data from the Storage table
     *
     * @param {string} val
     * @param {string} byField
     * @param {boolean} [isSoftSearch]
     * @return {Promise<Response>}
     */
    read(val: string | number, byField?: string, isSoftSearch: boolean = false)
    {
        let uri = BASE_URI;

        // Is the search by field name?
        if (byField) {
            // The REST service expects field names to be prefixed with _
            byField = '_' + byField;

            // Add endpoint to uri.
            uri += 'storage?' + `${byField}=${val}`;

            // If Soft Search is requested add this to the query parameters
            if (isSoftSearch) {
                uri += '&soft_search=' + isSoftSearch.toString();
            }

            uri += '&auth_key=' + this.authKey;
        } else {
            // Set search request endpoint to by Id.
            uri += 'storage/' + `${val}`;
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
     * Update an existing record in the Storage table
     *
     * @param {object} storageData
     * @return {Promise<Response>}
     */
    update(storageData: StorageType)
    {
        let uri = BASE_URI + 'storage' + '?auth_key=' + this.authKey;

        return frak.patch(uri, storageData)
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
