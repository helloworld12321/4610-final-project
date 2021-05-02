'use strict';

const aws = require('aws-sdk');

const { errorResponse } = require('./error-response');
const validators = require('./validators');

const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let runId, generation, numToReturn;
    try {
        const inputs = processQueryString(event.queryStringParameters);
        runId = inputs.runId;
        generation = inputs.generation;
        numToReturn = inputs.numToReturn;
    } catch (err) {
        if (err instanceof validators.ValidationError) {
            return errorResponse(400, err.message, context.awsRequestId);
        } else {
            return errorResponse(500, err.message, context.awsRequestId);
        }
    }

    try {
        let bestRoutes = await getBestRoutes(runId, generation, numToReturn);
        // The frontend expects the key to be named 'length', not 'distance'.
        // (We call it 'distance' in the database since 'length' is one of
        // DynamoDB's keywords.)
        bestRoutes = bestRoutes.map(({ routeId, distance }) =>
            ({ routeId, length: distance })
        );

        return {
            statusCode: 200,
            body: JSON.stringify(bestRoutes),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    } catch (err) {
        return errorResponse(500, err.message, context.awsRequestId);
    }


};

function processQueryString(queryStringParameters) {
    if (!queryStringParameters) {
        throw new validators.ValidationError('No query parameters');
    }
    const { runId, generation, numToReturn } = queryStringParameters;
    validators.checkRunId(runId);
    validators.checkGeneration(generation);
    validators.checkNumToReturn(numToReturn);
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
