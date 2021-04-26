'use strict';

const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { printf } = require('fast-printf');

const { errorResponse } = require('./error-response');
const validators = require('./validators');

const ddb = new aws.DynamoDB.DocumentClient();

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
            TableName: process.env.CITY_DATA_TABLE,
            Key: { region: 'Minnesota' },
        }).promise();
        const cityData = dbResults.Item;

        const route = randomRoute(cityData);
        const routeId = uuidv4();
        const distance = totalDistance(route, cityData);
        const partitionKey = runId + '#' + generation;
        // I'll assume that, for sorting purposes,
        // 1. the total distance will be smaller than one zettameter, and
        // 2. we need at most millimeter precision.
        const sortKey = printf('%021.3f', distance) + '#' + routeId;

        await ddb.put({
            TableName: process.env.ROUTES_TABLE,
            Item: {
                partitionKey,
                sortKey,
                routeId,
                runId,
                generation,
                route,
                distance,
            }
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({
                routeId,
                length: distance,
            }),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    } catch (err) {
        return errorResponse(500, err.message, context.awsRequestId);
    }
};

function processRequestBody(requestBody) {
    if (!requestBody) {
        throw 'No request body';
    }

    let jsonData;
    try {
        jsonData = JSON.parse(requestBody)
    } catch (err) {
        throw 'Request body is not valid JSON';
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

function totalDistance(route, cityData) {
    let distance = 0;
    for (let i = 0; i < route.length; i++) {
        const originIndex = route[i];
        // Wrap around to the beginning of the route if necessary.
        const destinationIndex = route[(i + 1) % route.length];

        distance += cityData.distances[originIndex][destinationIndex];
    }
    return distance;
}

/**
 * Shuffle an array out-of-place.
 */
function shuffledCopy(array) {
    const copy = Array.from(array);
    shuffle(copy);
    return copy;
}

/**
 * Shuffle an array in place.
 * (With the Fisher-Yates algorithm.)
 */
function shuffle(array) {
    for (let i = array.length - 1; i >= 1; i--) {
        const j = Math.floor((i + 1) * Math.random());
        [array[i], array[j]] = [array[j], array[i]];
    }
}
