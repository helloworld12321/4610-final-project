'use strict';

const aws = require('aws-sdk');
const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    const requestBody = JSON.parse(event.body);
    const runId = requestBody.runId;
    const generation = requestBody.generation;
    const numToReturn = requestBody.numToReturn;

    let bestRoutes;
    try {
        bestRoutes = getBestRoutes(runId, generation, numToReturn);
    } catch (err) {
        console.error(`Problem getting best runs for generation ${generation} of ${runId}:`);
        console.error(err);
        return errorResponse(err.message, context.awsRequestId);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(bestRoutes),
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    };
}

async function getBestRoutes(runId, generation, numToReturn) {
    // Note that the database is already sorted from shortest route to longest
    // route. So, the first `numToReturn` elements will be the best ones.
    const partitionKey = runId + '#' + generation;
    const dbResults = await ddb.query({
        TableName: 'routes',
        ProjectionExpression: 'routeId, length',
        KeyConditionExpression: 'partitionKey = :partitionKey',
        ExpressionAttributeValues: { ':partitionKey': partitionKey },
        Limit: numToReturn
    }).promise();
    return dbResults.Items;
}

function errorResponse(errorMessage, awsRequestId, callback) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
}
