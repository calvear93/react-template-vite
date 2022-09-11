/**
 * Some utilities for strings processing.
 *
 * @see https://vocajs.com/
 *
 * @summary String processing utilities.
 */

/**
 * Removes the string underscores.
 *
 * @param {string} str string.
 *
 * @returns {string} string without underscores.
 */
export const removeUnderscore = (str: string): string => {
    return str.replace(/_/g, ' ');
};

/**
 * Normalizes the string removing diacritics.
 *
 * @param {string} str string.
 *
 * @returns {string} string without diacritics.
 */
export const removeDiacritics = (str: string): string => {
    if (!str) return '';

    return str
        .toString()
        .normalize('NFD')
        .replace(/[\p{Diacritic}|\u0142\u0027]/gu, '');
};
