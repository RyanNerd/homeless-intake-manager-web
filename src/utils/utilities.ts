import {INodeListOf, ITarget} from "../typings/HtmlInterfaces";

interface IRecord {
    Id: number | string
}

/**
 * Return an object in an array based on the object's Id value
 *
 * @param {int} id Typically the PK of the record
 * @param {object[]} records Record set array
 * @return {object | null} Returns the record object if found, otherwise null.
 */
export function getRecordById(id: number, records: IRecord[]): IRecord | null
{
    let recordInfo = null;
    for (let record of records) {
        if (record.Id === id) {
            recordInfo = record;
            break;
        }
    }
    return recordInfo;
}

/**
 * Return array of objects sorted by the given column name
 *
 * @param {object[]} records Array of objects to be sorted
 * @param {string} columnName Column name to sort by.
 * @return {object[]} Return the newly sorted array.
 */
export function sortByColumnName(records: IRecord[], columnName: string): IRecord[]
{
    return records.sort((a, b)=>
    {
        if (!a[columnName]) {
            return -1;
        }

        if (typeof a[columnName] === 'string') {
            return a[columnName].localeCompare(b[columnName]);
        }

        if (a[columnName] > b[columnName]) {
            return 1
        }

        return 0;
    });
}

/**
 * Function that returns a unique id string
 *
 * @return {string}
 * @constructor
 */
export const UUID = function b (a?: any): string
{
    return a ? (a^Math.random()*16>>a/4).toString(16) : (''+[1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, b)
};

/**
 * Determine if a given string is a DataURL
 *
 * @param {string} str
 * @return {boolean} True if the string is a DataURL, false if otherwise.
 */
function isDataURL(str: string): boolean
{
    if (str === null) {
        return false;
    }
    const regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i;
    return !!str.match(regex);
}

/**
 * Return a HTMLImageElement that can be used safely in <canvas>
 *
 * @param {string} imageURL Resource address or a DataURL string.
 * @param crossOrigin CORS fixture
 * @return {Promise<HTMLImageElement>}
 */
export function loadImageURL(imageURL: string, crossOrigin?: string | null): Promise<HTMLImageElement>
{
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        if (isDataURL(imageURL) === false && crossOrigin) {
            image.crossOrigin = crossOrigin;
        }
        image.src = imageURL;
    });
}

interface IFileReaderTarget extends ITarget {
    result: string
}

/**
 * Convert an image File into a DataURL string.
 *
 * @param {File} imageFile File object.
 * @return {Promise<string>} Image as a DataURL string.
 */
export function imageFileToDataURL(imageFile: File): Promise<string>
{
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const target = e.target as IFileReaderTarget;
                resolve(target.result);
            } catch (e) {
                reject(e);
            }
        };

        reader.readAsDataURL(imageFile);
    });
}


/**
 * Return the mime type of a DataURL string.
 *
 * @see https://miguelmota.com/bytes/base64-mime-regex/
 * @param {string} encoded DataURL string
 * @return {string | null} Return mime type (e.g. image/png), or null if not mime type can not be determined.
 */
export function base64MimeType(encoded: string): string | null
{
    let result = null;

    let mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

    if (mime && mime.length) {
        result = mime[1];
    }

    return result;
}

/**
 * Calculate the age given a birth date as a string
 *
 * @see https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
 * @param {string} dateString
 * @return {number}
 */
export function calculateAge(dateString: string): number
{
    let birthday = +new Date(dateString);
    return ~~((Date.now() - birthday) / (31557600000));
}

/**
 * Calculate the difference in number of days between two dates.
 *
 * @param {string} date1
 * @param {string} date2
 * @return {number}
 */
export function dateDiffInDays(date1: string, date2: string): number
{
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24))+1;
}

/**
 * Returns a string in the format YYYY-MM-DD for a given date
 *
 * @param {Date} date
 * @return {string}
 */
export function dateToString(date: Date): string
{
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Really JavaScript this is zero based?
    const day = date.getDate(); // Really JavaScript this isn't zero based? Way to be inconsistent.

    return year.pad(4) + '-' + month.pad(2) + '-' + day.pad(2);
}

/**
 * Dynamically update the DOM to a specific language using the l10n functions.
 *
 * @param {string} language
 */
export function UpdateLanguage(language: string)
{
    let els = document.querySelectorAll("[data-l10n-id]") as INodeListOf;
    for(const el of els) {
        const dataL10n = el.getAttribute('data-l10n-id').substr(2);
        el.setAttribute('data-l10n-id', language + dataL10n);
    }
}