import Frak from "./Frak";
import {DocumentType} from "../models/DocumentModel";

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

interface IDocumentResponse extends Response {
    success: boolean;
    status: number;
    data: DocumentType;
}

/**
 * DocumentProvider Class
 */
export class DocumentProvider
{
    /**
     * DocumentProvider Constructor
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
     * Create new record in the Document table
     *
     * @param {object} documentData
     * @return {Promise<IDocumentResponse>}
     */
    public create(documentData: DocumentType): Promise<IDocumentResponse>
    {
        let uri = BASE_URI + 'documents';
        uri += '?auth_key=' + this.authKey;

        return frak.post(uri, documentData)
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
     * Read data from the Document table
     *
     * @param {string} [val]
     * @return {Promise<IDocumentResponse>}
     */
    public read(val: string | number | null = null): Promise<IDocumentResponse>
    {
        let uri = BASE_URI;

        // Is the search by field name?
        if (val === null) {
            // Add endpoint to uri.
            uri += 'documents';
        } else {
            // Set search request endpoint to by Id.
            uri += 'documents/' + `${val}`;
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
     * Update a record in the Document table
     *
     * @param {object} documentData
     * @return {Promise<IDocumentResponse>}
     */
    public update(documentData: DocumentType)
    {
        let uri = BASE_URI + 'documents';
        uri += '?auth_key=' + this.authKey;

        return frak.patch(uri, documentData)
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
