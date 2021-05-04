'use strict';

/**
 * Given:
 *
 * - a particular run of the evolutionary computation, and
 * - the generation number in the evolutionary computation,
 *
 * this lambda:
 *
 * - generates a route passing through all the cities in the Minnesota
 *   region,
 * - adds it to the database under that run and generation number, and
 * - sends back a brief summary of the route.
 */

const aws = require('aws-sdk');

const config = require('../config');
const { totalDistance } = require('../routes');
const { goodResponse, errorResponse, uid, shuffledCopy } = require('../utils');
const validators = require('../validators');

const ddb = new aws.DynamoDB.DocumentClient();

// TODO: Switch to new database format
exports.handler = async (event, context) => {
    let runId, generation;
    try {
        const inputs = processRequestBody(event.body);
        runId = inputs.runId;
        generation = inputs.generation;
    } catch (err) {
        if (err instanceof validators.ValidationError) {
            return errorResponse(400, err.message, context.awsRequestId);
        } else {
            return errorResponse(500, err.message, context.awsRequestId);
        }
    }

    try {
        const dbResults = await ddb.get({
            TableName: config.CITY_DATA_TABLE,
            Key: { region: 'Minnesota' },
        }).promise();
        const cityData = dbResults.Item;

        const route = randomRoute(cityData);
        const routeId = uid();
        const length = totalDistance(route, cityData);
        const runIdAndGeneration = runId + '#' + generation;

        await ddb.put({
            TableName: config.ROUTES_TABLE,
            Item: {
                routeId,
                runIdAndGeneration,
                runId,
                generation,
                length,
                route,
            }
        }).promise();

        return goodResponse(201, { routeId, length });
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
        jsonData = JSON.parse(requestBody)
    } catch (err) {
        throw new validators.ValidationError('Request body is not valid JSON');
    }

    const { runId, generation } = jsonData;
    validators.checkRunId(runId);
    validators.checkGeneration(generation);

    return {
        runId,
        generation: Number(generation),
    };
}

/**
 * Return a randomly selected route among the cities.
 *
 * The route is an array of integer indices. Each city's index is listed
 * exactly once.
 */
function randomRoute(cityData) {
    return shuffledCopy(cityData.cities.map(city => city.index));
}
