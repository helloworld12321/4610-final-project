'use strict';

/**
 * Given a particular run of the evolutionary computation and a generation
 * number from that run, this lambda sends the IDs of the N shortest routes
 * from that generation.
 *
 * (For a value of N provided by the caller.)
 */

const aws = require('aws-sdk');

const config = require('../config');
const { errorResponse } = require('../utils');
const validators = require('../validators');

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
    const runIdAndGeneration = runId + '#' + generation;
    const dbResults = await ddb.query({
        TableName: config.ROUTES_TABLE,
        IndexName: config.ROUTES_INDEX_SORTED_BY_DISTANCE,
        ProjectionExpression: 'routeId, #l',
        KeyConditionExpression: 'runIdAndGeneration = :r',
        ExpressionAttributeNames: { '#l': 'length' },
        ExpressionAttributeValues: { ':r': runIdAndGeneration },
        Limit: numToReturn,
    }).promise();
    return dbResults.Items;
}
