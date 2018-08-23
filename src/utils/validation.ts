/**
 * Validate that only alpha and dashes exist in the given string.
 * Intended to validate last and first names.
 *
 * @param {string} name;
 * @return {boolean}
 */
export function isNameValid(name: string): boolean
{
    if (name.length > 0) {
        return /^[a-zA-Z-]+$/.test(name);
    }
    return true;
}

/**
 * Validate that only digits exist in the given string.
 *
 * @param {string} str
 * @return {boolean}
 */
export function isDigitsOnly(str: string): boolean
{
    if (str.length > 0) {
        return /^[0-9]+$/.test(str);
    }
    return true;
}

/**
 * Validate that only lowercase alpha characters exist in the given string.
 *
 * @param {string} str;
 * @return {boolean}
 */
export function isLowercaseOnly(str: string): boolean
{
    if (str.length > 0) {
        return /^[a-z]+$/.test(str);
    }
    return true;
}

/**
 * Returns true if the given string has any whitespace
 *
 * @param {string} str
 * @return {boolean}
 */
export function hasWhitespace(str: string): boolean
{
    if (str.length > 0) {
        return !(/^\S+$/.test(str));
    }
    return true;
}

/**
 * Nick name (UserName) validation Regex allows for digits, lowercase alpha and underscore and dashes.
 * @param str
 * @return {boolean}
 */
export function isNickNameValid(str: string): boolean
{
    if (str.length > 0) {
        return /^[a-z0-9-]+$/.test(str);
    }
    return true;
}

/**
 * Return true if given string is a valid email address, false otherwise.
 *
 * @see http://emailregex.com/
 * @param {string} emailStr
 * @return {boolean}
 */
export function isEmailValid(emailStr: string): boolean
{
    if (emailStr.length >= 3) {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(emailStr);
    }
    return false;
}
