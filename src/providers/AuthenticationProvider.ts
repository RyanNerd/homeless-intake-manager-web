import Frak from "./Frak";

// Frak is a wrapper around fetch() specifically for handling JSON API payloads.
const frak = new Frak(false);

// Base URI is determined from .env settings.
const BASE_URI = process.env.API_PATH as string;

type CredentialsType = {
    Email: string,
    Password: string
};

export class AuthenticationProvider {
    /**
     * Given an email/username and password as credentials authenticate the user
     *
     * @todo figure out correct return type
     * @param {object} credentials
     * @return {Promise<Response>}
     */
    public authenticate(credentials: CredentialsType)
    {
        const uri = BASE_URI + 'authenticate';
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