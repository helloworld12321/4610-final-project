'use strict';

const crypto = require('crypto');

/**
 * A general purpose function for creating a successful HTTP response with
 * a JSON payload.
 */
exports.goodResponse = (statusCode, dataAsObject) => {
    return {
        statusCode,
        body: JSON.stringify(dataAsObject),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
    };
};

/**
 * A general-purpose function for creating an HTTP error response
 * (status code 4xx or 5xx).
 */
exports.errorResponse = (statusCode, errorMessage, awsRequestId) => {
    return {
        statusCode,
        body: JSON.stringify({ Error: errorMessage, Reference: awsRequestId }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
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
};

/**
 * Shuffle an array out-of-place.
 */
exports.shuffledCopy = (array) => {
    const copy = Array.from(array);
    exports.shuffle(copy);
    return copy;
};

/**
 * Shuffle an array in place.
 * (With the Fisher-Yates algorithm.)
 */
exports.shuffle = (array) => {
    for (let i = array.length - 1; i >= 1; i--) {
        const j = exports.randomIntBetween(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
};

/**
 * Return a random integer between start (inclusive) and end (exclusive).
 */
exports.randomIntBetween = (start, end) => {
    return Math.floor((end - start) * Math.random()) + start;
};
