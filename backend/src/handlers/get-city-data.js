/**
 * Send back a list of all of the cities in the Minnesota region.
 *
 * (This lambda sends back each city's name, latitude-longitude coordinates,
 * and an index number we use to identify it.)
 */

const aws = require('aws-sdk');

const config = require('../config');
const { errorResponse } = require('../utils');

const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    try {
        const dbResults = await ddb.get({
            TableName: config.CITY_DATA_TABLE,
            // Don't get the distances matrix; it's large and the client
            // doesn't need it.
            ProjectionExpression: 'region, cities',
            Key: { region: 'Minnesota' },
        }).promise();
        const cityData = dbResults.Item;

        return {
            statusCode: 200,
            body: JSON.stringify(cityData),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    } catch (err) {
        return errorResponse(500, err.message, context.awsRequestId);
    }
}
