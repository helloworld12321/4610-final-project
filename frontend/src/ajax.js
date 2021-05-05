/**
 * This file contains functions for talking to the backend.
 */

import * as $ from 'jquery';

import { baseUrl } from './config';
import { ajaxPromise, delay } from './utils';

export async function generateRandomRoute(runId, generation) {
    const { data } = await ajaxPromise({
        method: 'POST',
        url: `${baseUrl}/routes`,
        data: JSON.stringify({ runId, generation }),
        contentType: 'application/json',
    });
    return data;
}

export async function getBestRoutes(runId, generation, numToReturn) {
    const queryString = $.param({ runId, generation, numToReturn });
    const { data } = await ajaxPromise({
        method: 'GET',
        url: `${baseUrl}/best?${queryString}`,
        contentType: 'application/json',
    });
    return data;
}

export async function getRouteById(routeId) {
    const { data } = await ajaxPromise({
        method: 'GET',
        url: `${baseUrl}/routes/${encodeURIComponent(routeId)}`,
        contentType: 'application/json',
    });
    return data;
}

/**
 * Sometimes, we might not be able to get a route from the database because
 * DynamoDB hasn't reached eventual consistency yet. If that happens, try again
 * every second, for a specified number of retries.
 */
export async function getRouteByIdWithRetries(routeId, retries) {
    try {
        const data = await getRouteById(routeId);
        return data;
    } catch (err) {
        if (err.jqXhr?.status === 404 && retries > 0) {
            await delay(1000);
            const data = await getRouteByIdWithRetries(routeId, retries - 1);
            return data;
        } else {
            throw err;
        }
    }
}

export async function getCityData() {
    const { data } = await ajaxPromise({
        method: 'GET',
        url: `${baseUrl}/city-data`,
        contentType: 'application/json',
    });
    return data;
}

export async function mutateRoute(routeId, numChildren, lengthStoreThreshold) {
    const { data } = await ajaxPromise({
        method: 'POST',
        url: `${baseUrl}/mutate-route`,
        data: JSON.stringify({ routeId, numChildren, lengthStoreThreshold }),
        contentType: 'application/json',
    });
    return data;
}
