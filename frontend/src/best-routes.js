/**
 * This file contains methods for searching for the shortest routes within a
 * particular run ID and generation.
 */

import $ from 'jquery';
import * as page from './page';
import { baseUrl } from './config';

/**
 * Make a `GET` request that gets the K best routes.
 *
 * The form of the `GET` request is:
 *   …/best?runId=…&generation=…&numToReturn=…
 *
 * This request will return an array of
 *   { length: …, routeId: … }
 *
 * You should add each of these to `#best-route-list` (after clearing it
 * first).
 */
export function getBestRoutes() {
    let runId, generation, numBestToGet;
    try {
        runId = page.form.getRunId();
        generation = page.form.getGeneration();
        numBestToGet = page.form.getNumBestToGet();
    } catch (formProblem) {
        alert(formProblem);
        return;
    }

    page.clearBestRouteList();

    const queryString = $.param({
        runId,
        generation,
        numToReturn: numBestToGet,
    });

    $.ajax({
        method: 'GET',
        url: `${baseUrl}/best?${queryString}`,
    }).done(
        showBestRoutes,
    ).fail(
        showErrorGettingBestRoutes,
    );
}

function showBestRoutes(responseBody) {
    // The response body should be an array of routes ordered from shortest
    // to longest.
    for (const route of responseBody) {
        const routeId = route.routeId;
        const length = route.length;
        page.addToBestRouteList(`ID: ${routeId}, with length: ${length}`);
    }
}

function showErrorGettingBestRoutes(xhr, _, errorThrown) {
    console.error(`Error getting best routes: ${errorThrown}`);
    console.error(`Response: ${xhr.responseText}`);
    page.addToBestRouteList(`Error: ${errorThrown}`);
}
