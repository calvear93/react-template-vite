/**
 * Http fetching/requesting
 * utilities using axios.
 *
 * @summary http utils for fetching/requests
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import HttpStatus from 'http-status-codes';

/**
 * Http Methods.
 *
 * @type {object}
 */
export const HttpMethod: any = {
    HEAD: 'HEAD',
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
    OPTIONS: 'OPTIONS',
    TRACE: 'TRACE'
};

/**
 * Axios interceptor for
 * change error message.
 *
 * @param {AxiosError} error axios error object.
 */
function errorMessageInterceptor(error: AxiosError) {
    if (!error.response) {
        error.message = 'Connection error';

        return;
    }

    const { status, statusText } = error.response;

    // modifies error message.
    switch (status) {
        case HttpStatus.INTERNAL_SERVER_ERROR:
            error.message = `Server error '${statusText}'`;
            break;

        case HttpStatus.NOT_FOUND:
            error.message = `Service not found '${statusText}'`;
            break;

        default:
            error.message = `Request failed '${statusText}' [${status}]`;
    }
}

/**
 * Creates a http client.
 *
 * @param {string} baseURL base URL.
 * @param {object} [headers] default headers.
 *
 * @returns {AxiosInstance} axios http client.
 */
export function createHttpClient(
    baseURL: string,
    headers: object
): AxiosInstance {
    // creates an axios instance pre-configured.
    const client = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headers
        },
        responseType: 'json'
    });

    // error handler.
    client.interceptors.response.use(undefined, (error) => {
        errorMessageInterceptor(error);
        throw error;
    });

    return client;
}

/**
 * Http Status Codes.
 *
 * @type {object}
 */
export { default as HttpStatus } from 'http-status-codes';
