'use strict';

/**
 * Given the ID of a route in the database, return the full contents of that
 * route.
 */

const aws = require('aws-sdk');

const config = require('../config');
const { goodResponse, errorResponse } = require('../utils');
const validators = require('../validators');

const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let routeId;
    try {
        routeId = processPathParameters(event.pathParameters);
    } catch (err) {
        if (err instanceof validators.ValidationError) {
            return errorResponse(400, err.message, context.awsRequestId);
        } else {
            return errorResponse(500, err.message, context.awsRequestId);
        }
    }

    try {
        const dbResults = await ddb.query({
            TableName: config.ROUTES_TABLE,
            KeyConditionExpression: 'routeId = :r',
            ExpressionAttributeValues: { ':r': routeId },
        }).promise();

        if (dbResults.Items.length === 0) {
            return errorResponse(
                404,
                `No route found with ID ${routeId}`,
                context.awsRequestId,
            );
        } else {
            const route = dbResults.Items[0];
            return goodResponse(200, route);
        }
    } catch (err) {
        return errorResponse(500, err.message, context.awsRequestId);
    }
};

function processPathParameters(pathParameters) {
    if (!pathParameters) {
        throw new validators.ValidationError('No query parameters');
    }
    const routeId = pathParameters.routeId;
    validators.checkRouteId(routeId);
    return routeId;
}
