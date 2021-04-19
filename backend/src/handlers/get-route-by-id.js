'use strict';

const aws = require('aws-sdk');

const { errorResponse } = require('./error-response');
const validators = require('./validators');

const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let routeId;
    try {
        routeId = processPathParameters(event.pathParameters);
    } catch (err) {
        if (typeof err === 'string') {
            return errorResponse(400, err, context.awsRequestId);
        } else {
            return errorResponse(500, err.message, context.awsRequestId);
        }
    }

    try {
        const dbResults = await ddb.query({
            TableName: process.env.ROUTES_TABLE,
            IndexName: 'routeIdSecondaryIndex',
            KeyConditionExpression: 'routeId = :routeId',
            ExpressionAttributeValues: { ':routeId': routeId },
        }).promise();

        if (dbResults.Items.length === 0) {
            return errorResponse(
                404,
                `No route found with ID ${routeId}`,
                context.awsRequestId,
            );
        } else {
            const route = dbResults.Items[0];
            return {
                statusCode: 200,
                body: JSON.stringify(route),
                headers: { 'Access-Control-Allow-Origin': '*' },
            };
        }
    } catch (err) {
        return errorResponse(500, err.message, context.awsRequestId);
    }
};

function processPathParameters(pathParameters) {
    if (!pathParameters) {
        throw 'No query parameters';
    }
    const routeId = pathParameters.routeId;
    validators.checkRouteId(routeId);
    return routeId;
}
