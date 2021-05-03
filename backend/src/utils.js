'use strict';

const crypto = require('crypto');

/**
 * A general-purpose function for creating an HTTP error response
 * (status code 4xx or 5xx).
 */
exports.errorResponse = (statusCode, errorMessage, awsRequestId) => {
    return {
        statusCode,
        body: JSON.stringify({ Error: errorMessage, Reference: awsRequestId }),
        headers: { 'Access-Control-Allow-Origin': '*' },
    };
};

/**
 * Generate a unique identifier.
 *
 * (Ie, a long random identifier.)
 */
exports.uid = () => {
    // We could save database space by using base64, but it's a bit of a hassle
    // to make base64 data URL-safe.
    // Since this isn't a production-grade application, I'll use hex for
    // convenience.
    return crypto.randomBytes(16).toString('hex');
}
