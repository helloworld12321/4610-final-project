'use strict';

/**
 * Given the ID of a route in the database, create several slightly-modified
 * versions of that route, and add them to the database.
 *
 * This function sends back a list of summaries of the newly-created routes,
 * sorted by length. The shortest route's summary is first; the longest route's
 * summary is last.
 *
 * The caller can specify exactly how many new routes it wants.
 *
 * If the original route is listed in the database under run R and generation
 * G, the new routes will be added to the database under run R and generation
 * (G + 1).
 */

const aws = require('aws-sdk');

const config = require('../config');
const { generateChild } = require('../routes');
const { goodResponse, errorResponse } = require('../utils');
const validators = require('../validators');

const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let routeId, numChildren, lengthStoreThreshold;
    try {
        const inputs = processRequestBody(event.body);
        routeId = inputs.routeId;
        numChildren = inputs.numChildren;
        lengthStoreThreshold = inputs.lengthStoreThreshold;
    } catch (err) {
        if (err instanceof validators.ValidationError) {
            return errorResponse(400, err.message, context.awsRequestId);
        } else {
            return errorResponse(500, err.message, context.awsRequestId);
        }
    }

    try {
        const [cityData, parentRoute] = await Promise.all([
            getCityData(),
            getRouteById(routeId),
        ]);

        if (!parentRoute) {
            return errorResponse(
                404,
                `No route found with ID ${routeId}`,
                context.awsRequestId,
            );
        }

        const children = [];
        for (let i = 0; i < numChildren; i++) {
            children.push(generateChild(parentRoute, cityData));
        }

        const shortChildren = children.filter(childRoute =>
            childRoute.length < lengthStoreThreshold
        );

        await recordChildren(shortChildren);

        const summarizedShortChildren = shortChildren.map(childRoute =>
            ({
                routeId: childRoute.routeId,
                length: childRoute.length,
            })
        );

        summarizedShortChildren.sort((a, b) => a.length - b.length);

        return goodResponse(201, summarizedShortChildren);
    } catch (err) {
        return errorResponse(500, err.message, context.awsRequestId);
    }
};

function processRequestBody(requestBody) {
    if (!requestBody) {
        throw new validators.ValidationError('No request body');
    }

    let jsonData;
    try {
        jsonData = JSON.parse(requestBody);
    } catch (err) {
        throw new validators.ValidationError('Request body is not valid JSON');
    }

    let { routeId, numChildren, lengthStoreThreshold } = jsonData;
    validators.checkRouteId(routeId);
    validators.checkNumChildren(numChildren);
    validators.checkLengthStoreThreshold(lengthStoreThreshold);

    numChildren = Number(numChildren);
    if (lengthStoreThreshold === null || lengthStoreThreshold === undefined) {
        lengthStoreThreshold = Infinity;
    }

    return { routeId, numChildren, lengthStoreThreshold };
}

async function getCityData() {
    const dbResults = await ddb.get({
        TableName: config.CITY_DATA_TABLE,
        Key: { region: 'Minnesota' },
    }).promise();
    return dbResults.Item;
}

async function getRouteById(routeId) {
    const dbResults = await ddb.query({
        TableName: config.ROUTES_TABLE,
        KeyConditionExpression: 'routeId = :r',
        ExpressionAttributeValues: { ':r': routeId },
    }).promise();

    if (dbResults.Items.length === 0) {
        return null;
    } else {
        return dbResults.Items[0];
    }
}

async function recordChildren(childRoutes) {
    if (childRoutes.length === 0) {
        // DynamoDB errors out if you try to make a batch write with no items.
        return;
    } else {
        const putRequests = childRoutes.map(childRoute =>
            ({ PutRequest: { Item: childRoute } })
        );

        await ddb.batchWrite({
            RequestItems: {
                [config.ROUTES_TABLE]: putRequests,
            },
        }).promise();
    }
}
