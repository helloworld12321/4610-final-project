'use strict';

const aws = require('aws-sdk');
const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let runId, generation, numToReturn;
    try {
        const inputs = processQueryString(event.queryStringParameters);
        runId = inputs.runId;
        generation = inputs.generation;
        numToReturn = inputs.numToReturn;
    } catch (err) {
        return errorResponse(400, err, context.awsRequestId);
    }

    let bestRoutes;
    try {
        bestRoutes = await getBestRoutes(runId, generation, numToReturn);
    } catch (err) {
        console.error(`Problem getting best runs for generation ${generation} of ${runId}:`);
        console.error(err);
        return errorResponse(500, err.message, context.awsRequestId);
    }

    return {
        statusCode: 201,
        body: JSON.stringify(bestRoutes),
        headers: { 'Access-Control-Allow-Origin': '*' },
    };
};

function processQueryString(queryStringParameters) {
    if (!queryStringParameters) {
        throw 'No query parameters';
    }

    const { runId, generation, numToReturn } = queryStringParameters;

    if (!runId || runId === '') {
        throw 'Bad query string value for "runId"';
    }

    if (
        !generation
        || generation === ''
        || !Number.isInteger(Number(generation))
    ) {
        console.log('Hi!');
        throw 'Bad query string value for "generation"';
    }

    if (
        !numToReturn
        || numToReturn === ''
        || !Number.isInteger(Number(numToReturn))
        || Number(numToReturn) < 0
    ) {
        throw 'Bad query string value for "numToReturn"';
    }

    return {
        runId,
        generation: Number(generation),
        numToReturn: Number(numToReturn),
    };
}

async function getBestRoutes(runId, generation, numToReturn) {
    // Note that the database is already sorted from shortest route to longest
    // route. So, the first `numToReturn` elements will be the best ones.
    const partitionKey = runId + '#' + generation;
    const dbResults = await ddb.query({
        TableName: process.env.ROUTES_TABLE,
        ProjectionExpression: 'routeId, distance',
        KeyConditionExpression: 'partitionKey = :partitionKey',
        ExpressionAttributeValues: { ':partitionKey': partitionKey },
        Limit: numToReturn,
    }).promise();
    return dbResults.Items;
}

function errorResponse(statusCode, errorMessage, awsRequestId) {
    return {
        statusCode,
        body: JSON.stringify({ Error: errorMessage, Reference: awsRequestId }),
        headers: { 'Access-Control-Allow-Origin': '*' },
    };
}
