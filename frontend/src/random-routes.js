/**
 * This file contains methods for generating random routes.
 */

import $ from 'jquery';
import * as page from './page';
import { baseUrl } from './config';

/**
 * Generates a collection of new routes, where the number to generate (and the
 * runId and generation) are specified in the HTML text fields.
 */
export function makeRandomRoutes() {
    let runId, generation, numToGenerate;
    try {
        runId = page.form.getRunId();
        generation = page.form.getGeneration();
        numToGenerate = page.form.getNumToGenerate();
    } catch (formProblem) {
        alert(formProblem);
        return;
    }

    // Reset the contents of `#new-route-list` so that it's ready for
    // `showRoute()` to "fill" it with the incoming new routes.
    page.clearNewRouteList();

    for (let i = 0; i < numToGenerate; i++) {
        makeOneRandomRoute(runId, generation)
          .done(showNewRoute)
          .fail(showErrorMakingRoute);
    }
}

/**
 * This generates a single random route by POSTing the runId and generation to
 * the `/routes` endpoint. It's asynchronous (like requests across the network
 * typically are), and the showRoute() function is called when the request
 * response comes in.
 */
function makeOneRandomRoute(runId, generation) {
    return $.ajax({
        method: 'POST',
        url: `${baseUrl}/routes`,
        data: JSON.stringify({ runId, generation }),
        contentType: 'application/json',
    });
}

/**
 * When a request for a new route completes successfully, add a `<li>…</li>`
 * element to `#new-route-list` with that routes information.
 */
function showNewRoute(responseBody) {
    console.log(`New route received from API: ${responseBody}`);
    const routeId = responseBody.routeId;
    const length = responseBody.length;
    page.addToNewRouteList(`Generated route ${routeId} with length ${length}`);
}

/**
 * When a request for a new route completes unsuccessfully, add an element to
 * the `#new-route-list` with an error message.
 */
function showErrorMakingRoute(xhr, _, errorThrown) {
    console.error(`Error generating random route: ${errorThrown}`);
    console.error(`Response: ${xhr.responseText}`);
    page.addToNewRouteList(`Error: ${errorThrown}`);
}
