'use strict';

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
